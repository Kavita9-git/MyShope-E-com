# Push Notification Integration Guide

## Overview
This guide explains how to integrate the push notification system into your React Native e-commerce app.

## Files Created
1. **Backend:**
   - `server/models/notificationModel.js` - Notification data model
   - `server/controllers/notificationController.js` - API controllers for notifications
   - `server/routes/notificationRoutes.js` - Express routes for notification API
   - Enhanced `server/models/userModel.js` - Added notification fields
   - Enhanced `server/controllers/orderController.js` - Added push notifications to order flow

2. **Frontend:**
   - `client/services/NotificationService.js` - Core notification service
   - `client/components/NotificationManager.js` - UI component for managing notifications

## Integration Steps

### 1. Backend Setup
The backend is already configured with the notification routes registered in `server/server.js`.

Make sure to install the required package:
```bash
cd server
npm install expo-server-sdk
```

### 2. Frontend Integration

#### A. Import NotificationService in App.js
```javascript
// In your main App.js or wherever you handle app initialization
import { NotificationService } from './services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize notifications when app starts
    NotificationService.initialize();
  }, []);
  
  // ... rest of your app code
}
```

#### B. Add NotificationManager to Navigation
Add the NotificationManager screen to your navigation stack:

```javascript
// In your navigation setup file
import NotificationManager from './components/NotificationManager';

// Add to your Stack Navigator
<Stack.Screen 
  name="Notifications" 
  component={NotificationManager} 
  options={{ title: 'Notifications' }}
/>
```

#### C. Register Push Token on Login
In your login/authentication flow:

```javascript
// In your login success handler
import { NotificationService } from '../services/NotificationService';

const handleLoginSuccess = async (userData) => {
  // ... existing login logic
  
  // Register push token for notifications
  try {
    await NotificationService.registerPushToken();
    console.log('✅ Push token registered successfully');
  } catch (error) {
    console.log('⚠️ Push token registration failed:', error);
  }
};
```

#### D. Handle Notification Responses
Set up notification response handling in your main app component:

```javascript
// In App.js or root component
import { NotificationService } from './services/NotificationService';

export default function App() {
  const [navigationRef, setNavigationRef] = useState(null);

  useEffect(() => {
    NotificationService.initialize();
    
    // Handle notification responses (when user taps notification)
    const handleNotificationResponse = (response) => {
      const { data } = response.notification.request.content;
      
      if (data?.orderId && navigationRef) {
        navigationRef.navigate('OrderDetails', { orderId: data.orderId });
      }
    };

    NotificationService.addNotificationResponseReceivedListener(handleNotificationResponse);
  }, [navigationRef]);

  return (
    <NavigationContainer ref={setNavigationRef}>
      {/* Your navigation components */}
    </NavigationContainer>
  );
}
```

### 3. Add Notifications Button to Header/Menu
Add a notifications icon to your app's header or menu:

```javascript
// In your header component or main menu
import { NotificationService } from '../services/NotificationService';

const HeaderComponent = ({ navigation }) => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  const checkUnreadNotifications = async () => {
    try {
      // You can implement this method in NotificationService if needed
      // For now, you could check via API call or local storage
      setHasUnread(true); // Placeholder
    } catch (error) {
      console.log('Error checking notifications:', error);
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Notifications')}
        style={styles.notificationButton}
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {hasUnread && <View style={styles.badgeDot} />}
      </TouchableOpacity>
    </View>
  );
};
```

### 4. Order Flow Integration
The order controller already includes notification sending. No additional frontend changes needed for basic order notifications.

### 5. Testing the Implementation

#### A. Test Local Notifications
Use the test button in the NotificationManager component to send a local test notification.

#### B. Test Push Notifications via API
You can test push notifications by calling the API endpoints:

```bash
# Register a push token (replace with actual token and user ID)
curl -X POST http://localhost:8080/api/v1/notification/register-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[your-token-here]",
    "userId": "user-id-here"
  }'

# Send a test notification (admin only)
curl -X POST http://localhost:8080/api/v1/notification/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token-here" \
  -d '{
    "userId": "user-id-here",
    "title": "Test Notification",
    "message": "This is a test push notification"
  }'
```

### 6. Environment Configuration
Make sure your `.env` file in the server directory includes any necessary configuration for Expo push notifications. Currently, no additional environment variables are required for Expo notifications.

### 7. Production Considerations

1. **Error Handling**: The system includes comprehensive error handling, but monitor logs for any issues.

2. **Token Cleanup**: The system automatically handles token cleanup for expired/invalid tokens.

3. **Rate Limiting**: Consider implementing rate limiting for notification endpoints if needed.

4. **Analytics**: The notification model includes analytics fields for tracking delivery and engagement.

5. **Scheduling**: The system supports scheduled notifications - implement cron jobs or task schedulers as needed.

## API Endpoints Summary

- `POST /api/v1/notification/register-token` - Register push token
- `GET /api/v1/notification/user/:userId` - Get user notifications  
- `PUT /api/v1/notification/preferences` - Update notification preferences
- `PUT /api/v1/notification/read/:notificationId` - Mark notification as read
- `POST /api/v1/notification/send` - Send single notification (admin)
- `POST /api/v1/notification/send-bulk` - Send bulk notifications (admin)
- `POST /api/v1/notification/send-order` - Send order notification (admin)

## Notification Types Supported
- **Order Notifications**: confirmation, shipping, delivery
- **Marketing**: promotions, new products, recommendations  
- **Engagement**: wishlist updates, cart reminders, review requests

The system is now ready for use! Test thoroughly in development before deploying to production.
