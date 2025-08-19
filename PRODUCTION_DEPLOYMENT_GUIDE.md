# 🚀 Production Push Notifications Deployment Guide

## Overview

This guide covers the complete setup for deploying your React Native e-commerce notification system to production, including both client-side and server-side configurations.

## 📋 Prerequisites

- React Native project with Expo
- Firebase project with Cloud Messaging enabled
- Node.js backend server
- MongoDB database
- Google Play Console and Apple Developer accounts (for production)

## 🔧 Firebase Configuration

### 1. Firebase Console Setup

1. **Create Firebase Project**
   ```bash
   # Visit https://console.firebase.google.com
   # Create new project or use existing one
   # Enable Authentication and Cloud Messaging
   ```

2. **Generate Service Account Key**
   ```bash
   # Go to Project Settings > Service Accounts
   # Generate new private key
   # Download firebase-service-account.json
   ```

3. **Configure Push Notifications**
   ```javascript
   // firebase-config.js
   import { initializeApp } from 'firebase/app';
   
   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
   };
   
   const app = initializeApp(firebaseConfig);
   export default app;
   ```

### 2. EAS Build Configuration

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/cli@latest eas-cli
   eas login
   ```

2. **Configure eas.json**
   ```json
   {
     "cli": {
       "version": ">= 5.8.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "autoIncrement": true,
         "env": {
           "EXPO_PUBLIC_FIREBASE_API_KEY": "your-firebase-api-key",
           "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

3. **Configure app.json/app.config.js**
   ```javascript
   // app.config.js
   export default {
     expo: {
       name: "Your E-Commerce App",
       slug: "your-ecommerce-app",
       version: "1.0.0",
       platforms: ["ios", "android"],
       plugins: [
         [
           "expo-notifications",
           {
             icon: "./assets/notification-icon.png",
             color: "#ffffff",
             sounds: ["./assets/notification-sound.wav"],
             mode: "production"
           }
         ],
         [
           "@react-native-firebase/app",
           {
             android: {
               googleServicesFile: "./google-services.json"
             },
             ios: {
               googleServicesPlist: "./GoogleService-Info.plist"
             }
           }
         ]
       ],
       android: {
         package: "com.yourcompany.ecommerce",
         googleServicesFile: "./google-services.json",
         permissions: [
           "RECEIVE_BOOT_COMPLETED",
           "VIBRATE",
           "WAKE_LOCK"
         ],
         notification: {
           icon: "./assets/notification-icon.png",
           color: "#000000",
           androidMode: "default",
           androidCollapsedTitle: "#{unread_notifications} new notifications"
         }
       },
       ios: {
         bundleIdentifier: "com.yourcompany.ecommerce",
         googleServicesPlist: "./GoogleService-Info.plist",
         infoPlist: {
           UIBackgroundModes: ["remote-notification"]
         }
       }
     }
   };
   ```

## 🏗️ Backend Server Configuration

### 1. Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce-notifications
JWT_SECRET=your-super-secure-jwt-secret

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Redis for job queue (optional)
REDIS_URL=redis://localhost:6379

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Firebase Admin SDK Setup

```javascript
// config/firebase-admin.js
const admin = require('firebase-admin');

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

module.exports = admin;
```

### 3. Express Server Setup

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notifications');
const authMiddleware = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'exp://localhost:19000']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.use('/api/notifications', authMiddleware, notificationRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### 4. Notification Routes

```javascript
// routes/notifications.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Token management
router.post('/register-token', NotificationController.registerToken);

// Send notifications
router.post('/send', NotificationController.sendNotification);

// Preferences
router.get('/preferences', NotificationController.getPreferences);
router.put('/preferences', NotificationController.updatePreferences);

// History and analytics
router.get('/history', NotificationController.getHistory);
router.get('/analytics', NotificationController.getAnalytics);

// Triggers
router.post('/trigger/order', NotificationController.triggerOrderNotification);
router.post('/trigger/price-drop', NotificationController.triggerPriceDropNotifications);

module.exports = router;
```

## 📱 Client-Side Production Setup

### 1. Notification Service Registration

```javascript
// services/ProductionNotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class ProductionNotificationService {
  constructor() {
    this.initialize();
  }

  async initialize() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions
    await this.requestPermissions();

    // Register for push tokens
    await this.registerForPushNotifications();

    // Set up notification listeners
    this.setupNotificationListeners();
  }

  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return false;
      }

      return true;
    } else {
      console.warn('Push notifications only work on physical devices');
      return false;
    }
  }

  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) return;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('📱 Push token:', token.data);

      // Save token locally
      await AsyncStorage.setItem('pushToken', token.data);

      // Register with backend
      await this.registerTokenWithBackend(token.data);

      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
    }
  }

  async registerTokenWithBackend(token) {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: Constants.deviceId,
        }),
      });

      if (response.ok) {
        console.log('✅ Token registered with backend');
      }
    } catch (error) {
      console.error('Failed to register token with backend:', error);
    }
  }

  setupNotificationListeners() {
    // Handle notification received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    // Handle notification tap
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationResponse(response);
    });
  }

  async handleNotificationResponse(response) {
    const { notification } = response;
    const data = notification.request.content.data;

    // Store navigation data for app to handle
    await AsyncStorage.setItem('pendingNavigation', JSON.stringify(data));

    // Execute navigation if handler is set
    if (this.navigationHandler) {
      this.navigationHandler(data);
    }
  }

  // Rest of the methods from your existing NotificationService
}

export default new ProductionNotificationService();
```

### 2. App Integration

```javascript
// App.js
import ProductionNotificationService from './services/ProductionNotificationService';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  useEffect(() => {
    // Initialize notification service
    ProductionNotificationService.initialize();

    // Set navigation handler
    ProductionNotificationService.setNavigationHandler((data) => {
      // Handle deep linking based on notification data
      switch (data.type) {
        case 'order_update':
          // Navigate to order details
          break;
        case 'price_drop':
          // Navigate to product
          break;
        // ... other cases
      }
    });
  }, []);

  return (
    <NavigationContainer>
      {/* Your app navigation */}
    </NavigationContainer>
  );
}
```

## 🏭 Production Deployment Steps

### 1. Build and Deploy Backend

```bash
# 1. Prepare production environment
npm install --production
npm run build  # if you have a build step

# 2. Set environment variables on your server
# Use your hosting provider's method (Heroku, DigitalOcean, AWS, etc.)

# 3. Start production server
npm run start  # or use PM2 for process management
pm2 start server.js --name "ecommerce-api"
```

### 2. Build React Native App

```bash
# 1. Install dependencies
npm install

# 2. Configure credentials
eas credentials:configure

# 3. Build for production
eas build --platform all --profile production

# 4. Submit to stores
eas submit --platform ios
eas submit --platform android
```

### 3. Database Setup

```javascript
// scripts/setup-notification-indexes.js
const mongoose = require('mongoose');

async function setupIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const db = mongoose.connection.db;
  
  // Notification history indexes
  await db.collection('notificationhistories').createIndexes([
    { userId: 1, type: 1, sentAt: -1 },
    { status: 1, sentAt: 1 },
    { campaignId: 1, sentAt: -1 }
  ]);
  
  // User indexes for notifications
  await db.collection('users').createIndexes([
    { pushToken: 1 },
    { notificationEnabled: 1 },
    { lastActiveAt: -1 }
  ]);
  
  console.log('✅ Notification indexes created');
  process.exit(0);
}

setupIndexes().catch(console.error);
```

## 📊 Monitoring and Analytics

### 1. Health Check Endpoint

```javascript
// routes/health.js
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check Redis (if using)
    // await redisClient.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        notifications: 'active'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 2. Notification Analytics Dashboard

```javascript
// Create a simple analytics endpoint
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
    
    const stats = await NotificationHistory.aggregate([
      {
        $match: {
          sentAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          openRate: { $avg: { $cond: ['$opened', 1, 0] } }
        }
      }
    ]);
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🔒 Security Considerations

### 1. Rate Limiting

```javascript
// Specific rate limiting for notification endpoints
const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many notification requests, please try again later.'
});

router.post('/send', notificationLimiter, NotificationController.sendNotification);
```

### 2. Input Validation

```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateNotification = [
  body('title').isLength({ min: 1, max: 100 }).trim().escape(),
  body('body').isLength({ min: 1, max: 500 }).trim().escape(),
  body('type').isIn(['order_update', 'price_drop', 'promotion', 'general']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post('/send', validateNotification, NotificationController.sendNotification);
```

## 🧪 Testing in Production

### 1. Test Notification Endpoint

```javascript
// Test endpoint for production verification
router.post('/test-notification', async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    const userId = req.user._id;
    
    await NotificationController._sendToUser(
      req.user,
      '🧪 Test Notification',
      'This is a test notification to verify your setup.',
      { type: 'general', test: true }
    );
    
    res.json({ message: 'Test notification sent' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
```

### 2. Verification Checklist

- [ ] Firebase project configured with correct keys
- [ ] Push tokens registering successfully
- [ ] Notifications sending from backend
- [ ] Deep linking working correctly
- [ ] User preferences saving
- [ ] Analytics tracking properly
- [ ] Rate limiting in place
- [ ] Error handling working
- [ ] Database indexes created
- [ ] Health checks responding

## 🚨 Troubleshooting

### Common Issues

1. **Notifications not receiving**
   - Check Firebase configuration
   - Verify push token registration
   - Ensure device permissions granted

2. **Deep linking not working**
   - Verify navigation handler setup
   - Check app.json configuration
   - Test with different notification types

3. **High server load**
   - Implement background job queue
   - Add more rate limiting
   - Optimize database queries

4. **Database performance**
   - Ensure proper indexing
   - Monitor query performance
   - Consider archiving old notifications

This completes your production deployment setup! Your notification system is now ready for real-world usage with proper scaling, security, and monitoring in place.
