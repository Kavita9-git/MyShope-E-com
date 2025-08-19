/**
 * 🤖 Automated Notification System
 * 
 * This system automatically triggers notifications based on:
 * - Database changes (orders, products, users)
 * - Scheduled events (cart abandonment, price monitoring)
 * - User behavior patterns
 * - Time-based triggers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Alert } from 'react-native';
import notificationService from '../services/NotificationService';

class AutomatedNotificationSystem {
  constructor() {
    this.API_BASE_URL = 'https://nodejsapp-hfpl.onrender.com/api/v1';
    this.intervals = new Map(); // Store interval IDs for cleanup
    this.isInitialized = false;
    this.appStateSubscription = null;
  }

  /**
   * 🚀 Initialize the automated system
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log('🤖 Initializing Automated Notification System...');

    // Start all automated processes
    await this.startCartAbandonmentMonitor();
    await this.startWishlistPriceMonitor();
    await this.startOrderStatusMonitor();
    await this.startInventoryMonitor();
    await this.startUserEngagementMonitor();
    await this.setupAppStateHandlers();

    this.isInitialized = true;
    console.log('✅ Automated Notification System initialized');
  }

  /**
   * 🛒 AUTOMATED CART ABANDONMENT MONITOR
   * Automatically detects when users abandon their carts and sends progressive reminders
   */
  async startCartAbandonmentMonitor() {
    console.log('🛒 Starting cart abandonment monitor...');

    // Monitor cart changes every 5 minutes
    const cartMonitorInterval = setInterval(async () => {
      try {
        await this.checkCartAbandonment();
      } catch (error) {
        console.error('❌ Cart abandonment check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.set('cartMonitor', cartMonitorInterval);
  }

  async checkCartAbandonment() {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const { token: userToken } = JSON.parse(userData);
    if (!userToken) return;

    try {
      // Get current cart from server
      const response = await fetch(`${this.API_BASE_URL}/user/get-cart`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });

      if (!response.ok) return;

      const cartData = await response.json();
      const cartItems = cartData?.cart || [];

      if (cartItems.length === 0) {
        // Clear any existing abandonment timers
        await this.clearCartAbandonmentTimers();
        return;
      }

      // Check if cart has been idle
      const lastCartUpdate = await AsyncStorage.getItem('@last_cart_update');
      const lastUpdate = lastCartUpdate ? new Date(lastCartUpdate) : new Date();
      const minutesSinceUpdate = (new Date() - lastUpdate) / (1000 * 60);

      console.log(`🛒 Cart idle for ${minutesSinceUpdate.toFixed(1)} minutes`);

      // Progressive abandonment reminders
      if (minutesSinceUpdate >= 30 && !(await this.hasSentReminder('30min'))) {
        await this.sendCartAbandonmentReminder(cartItems, '30min');
      } else if (minutesSinceUpdate >= 120 && !(await this.hasSentReminder('2hour'))) {
        await this.sendCartAbandonmentReminder(cartItems, '2hour');
      } else if (minutesSinceUpdate >= 1440 && !(await this.hasSentReminder('24hour'))) {
        await this.sendCartAbandonmentReminder(cartItems, '24hour');
      }

    } catch (error) {
      console.error('❌ Cart abandonment check error:', error);
    }
  }

  async sendCartAbandonmentReminder(cartItems, reminderType) {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const { token: userToken } = JSON.parse(userData);
    if (!userToken) return;

    const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemNames = cartItems.slice(0, 3).map(item => item.name).join(', ');
    const moreItems = cartItems.length > 3 ? ` and ${cartItems.length - 3} more items` : '';

    const messages = {
      '30min': {
        title: "Don't forget your cart! 🛒",
        body: `You have ${cartItems.length} items waiting: ${itemNames}${moreItems}`
      },
      '2hour': {
        title: "Items in your cart are popular! 🔥",
        body: `${itemNames}${moreItems} might sell out soon. Total: $${totalValue.toFixed(2)}`
      },
      '24hour': {
        title: "Last chance for your cart items! ⏰",
        body: `Complete your order of ${itemNames}${moreItems} before they're gone!`
      }
    };

    const message = messages[reminderType];

    // Send local notification
    await notificationService.sendLocalNotification(
      message.title,
      message.body,
      {
        type: 'cart_abandonment',
        reminderType,
        cartValue: totalValue,
        itemCount: cartItems.length
      }
    );

    // Send server notification for persistence
    await this.sendServerNotification({
      endpoint: '/notifications/send',
      data: {
        title: message.title,
        body: message.body,
        type: 'cart_abandonment',
        data: { reminderType, cartValue: totalValue }
      }
    });

    // Mark reminder as sent
    await AsyncStorage.setItem(`@cart_reminder_${reminderType}`, new Date().toISOString());
    console.log(`✅ Cart abandonment reminder sent: ${reminderType}`);
  }

  /**
   * 💝 AUTOMATED WISHLIST PRICE MONITOR
   * Automatically monitors wishlist items for price drops and stock changes
   */
  async startWishlistPriceMonitor() {
    console.log('💝 Starting wishlist price monitor...');

    // Check prices every 30 minutes
    const priceMonitorInterval = setInterval(async () => {
      try {
        await this.checkWishlistPrices();
      } catch (error) {
        console.error('❌ Wishlist price check failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    this.intervals.set('priceMonitor', priceMonitorInterval);
  }

  async checkWishlistPrices() {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const { token: userToken } = JSON.parse(userData);
    if (!userToken) return;

    try {
      // Get current wishlist from server
      const response = await fetch(`${this.API_BASE_URL}/user/get-wishlist`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });

      if (!response.ok) return;

      const wishlistData = await response.json();
      const wishlistItems = wishlistData?.wishlist || [];

      if (wishlistItems.length === 0) return;

      // Get stored price history
      const priceHistoryStr = await AsyncStorage.getItem('@price_history');
      const priceHistory = priceHistoryStr ? JSON.parse(priceHistoryStr) : {};

      for (const item of wishlistItems) {
        const currentPrice = item.price || item.discountprice;
        const productId = item.productId?._id || item.productId;
        const productName = item.name;
        const storedPrice = priceHistory[productId];

        // Check for price drop (minimum 5% decrease)
        if (storedPrice && currentPrice < storedPrice * 0.95) {
          const discount = storedPrice - currentPrice;
          const discountPercent = Math.round((discount / storedPrice) * 100);

          // Send price drop notification
          await this.sendPriceDropNotification({
            productId,
            productName,
            oldPrice: storedPrice,
            newPrice: currentPrice,
            discountPercent
          });
        }

        // Update price history
        priceHistory[productId] = currentPrice;
      }

      // Save updated price history
      await AsyncStorage.setItem('@price_history', JSON.stringify(priceHistory));
      console.log(`✅ Price monitoring completed for ${wishlistItems.length} items`);

    } catch (error) {
      console.error('❌ Wishlist price monitoring error:', error);
    }
  }

  async sendPriceDropNotification({ productId, productName, oldPrice, newPrice, discountPercent }) {
    const title = 'Price Drop Alert! 📉';
    const body = `${productName} is now $${newPrice.toFixed(2)} (was $${oldPrice.toFixed(2)}). Save ${discountPercent}% now!`;

    // Send local notification
    await notificationService.sendLocalNotification(title, body, {
      type: 'price_drop',
      productId,
      productName,
      oldPrice,
      newPrice,
      discountPercent
    });

    // Send server notification
    await this.sendServerNotification({
      endpoint: '/notifications/send',
      data: {
        title,
        body,
        type: 'price_drop',
        data: { productId, productName, oldPrice, newPrice, discountPercent }
      }
    });

    console.log(`✅ Price drop notification sent for ${productName}`);
  }

  /**
   * 📦 AUTOMATED ORDER STATUS MONITOR
   * Automatically checks for order status updates and notifies users
   */
  async startOrderStatusMonitor() {
    console.log('📦 Starting order status monitor...');

    // Check order status every 15 minutes
    const orderMonitorInterval = setInterval(async () => {
      try {
        await this.checkOrderStatusUpdates();
      } catch (error) {
        console.error('❌ Order status check failed:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes

    this.intervals.set('orderMonitor', orderMonitorInterval);
  }

  async checkOrderStatusUpdates() {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const { token: userToken } = JSON.parse(userData);
    if (!userToken) return;

    try {
      // Get user's recent orders
      const response = await fetch(`${this.API_BASE_URL}/order/my-orders`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });

      if (!response.ok) return;

      const ordersData = await response.json();
      const orders = ordersData?.orders || [];

      // Get stored order statuses
      const storedStatusesStr = await AsyncStorage.getItem('@order_statuses');
      const storedStatuses = storedStatusesStr ? JSON.parse(storedStatusesStr) : {};

      for (const order of orders) {
        const orderId = order._id;
        const currentStatus = order.status;
        const storedStatus = storedStatuses[orderId];

        // Check if status has changed
        if (storedStatus && storedStatus !== currentStatus) {
          await this.sendOrderStatusNotification(order, currentStatus, storedStatus);
        }

        // Update stored status
        storedStatuses[orderId] = currentStatus;
      }

      // Save updated statuses
      await AsyncStorage.setItem('@order_statuses', JSON.stringify(storedStatuses));
      console.log(`✅ Order status monitoring completed for ${orders.length} orders`);

    } catch (error) {
      console.error('❌ Order status monitoring error:', error);
    }
  }

  async sendOrderStatusNotification(order, newStatus, oldStatus) {
    const statusMessages = {
      processing: {
        title: 'Order Being Prepared 📦',
        body: `Great news! We're preparing your order #${order.orderNumber} for shipment.`
      },
      shipped: {
        title: 'Order Shipped! 🚚',
        body: `Your order #${order.orderNumber} is on the way! Track your package for updates.`
      },
      delivered: {
        title: 'Order Delivered! ✅',
        body: `Your order #${order.orderNumber} has been delivered successfully. Enjoy!`
      },
      cancelled: {
        title: 'Order Cancelled',
        body: `Your order #${order.orderNumber} has been cancelled. Refund will be processed soon.`
      }
    };

    const statusInfo = statusMessages[newStatus];
    if (!statusInfo) return;

    // Send local notification
    await notificationService.sendLocalNotification(
      statusInfo.title,
      statusInfo.body,
      {
        type: 'order_update',
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        oldStatus
      }
    );

    // Send server notification
    await this.sendServerNotification({
      endpoint: '/notifications/send-order',
      data: {
        orderId: order._id,
        type: `order_${newStatus}`,
        title: statusInfo.title,
        body: statusInfo.body
      }
    });

    console.log(`✅ Order status notification sent: ${oldStatus} → ${newStatus}`);
  }

  /**
   * 📊 AUTOMATED INVENTORY MONITOR
   * Monitors wishlist items for stock availability
   */
  async startInventoryMonitor() {
    console.log('📊 Starting inventory monitor...');

    // Check inventory every 2 hours
    const inventoryInterval = setInterval(async () => {
      try {
        await this.checkInventoryUpdates();
      } catch (error) {
        console.error('❌ Inventory check failed:', error);
      }
    }, 2 * 60 * 60 * 1000); // 2 hours

    this.intervals.set('inventoryMonitor', inventoryInterval);
  }

  async checkInventoryUpdates() {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const { token: userToken } = JSON.parse(userData);
    if (!userToken) return;

    try {
      // Get wishlist items
      const response = await fetch(`${this.API_BASE_URL}/user/get-wishlist`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });

      if (!response.ok) return;

      const wishlistData = await response.json();
      const wishlistItems = wishlistData?.wishlist || [];

      // Check each item's stock status
      for (const item of wishlistItems) {
        const productId = item.productId?._id || item.productId;
        
        // Get current product details
        const productResponse = await fetch(`${this.API_BASE_URL}/product/get-product/${productId}`);
        if (!productResponse.ok) continue;

        const productData = await productResponse.json();
        const product = productData?.product;
        
        if (product && product.quantity > 0) {
          // Check if this item was previously out of stock
          const wasOutOfStock = await this.wasProductOutOfStock(productId);
          
          if (wasOutOfStock) {
            await this.sendBackInStockNotification(product);
            await this.markProductInStock(productId);
          }
        } else {
          // Mark as out of stock
          await this.markProductOutOfStock(productId);
        }
      }

      console.log(`✅ Inventory monitoring completed`);

    } catch (error) {
      console.error('❌ Inventory monitoring error:', error);
    }
  }

  async sendBackInStockNotification(product) {
    const title = 'Back in Stock! 🎉';
    const body = `${product.name} is now available. Get it before it sells out again!`;

    // Send local notification
    await notificationService.sendLocalNotification(title, body, {
      type: 'back_in_stock',
      productId: product._id,
      productName: product.name,
      currentStock: product.quantity
    });

    // Send server notification
    await this.sendServerNotification({
      endpoint: '/notifications/send',
      data: {
        title,
        body,
        type: 'wishlist_update',
        data: { productId: product._id, productName: product.name }
      }
    });

    console.log(`✅ Back in stock notification sent for ${product.name}`);
  }

  /**
   * 👤 USER ENGAGEMENT MONITOR
   * Sends engagement notifications based on user behavior
   */
  async startUserEngagementMonitor() {
    console.log('👤 Starting user engagement monitor...');

    // Check engagement every 4 hours
    const engagementInterval = setInterval(async () => {
      try {
        await this.checkUserEngagement();
      } catch (error) {
        console.error('❌ Engagement check failed:', error);
      }
    }, 4 * 60 * 60 * 1000); // 4 hours

    this.intervals.set('engagementMonitor', engagementInterval);
  }

  async checkUserEngagement() {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const { token: userToken } = JSON.parse(userData);
    if (!userToken) return;

    const lastAppOpen = await AsyncStorage.getItem('@last_app_open');
    if (!lastAppOpen) return;

    const hoursSinceLastOpen = (new Date() - new Date(lastAppOpen)) / (1000 * 60 * 60);

    // Send re-engagement notification if user hasn't opened app in 48 hours
    if (hoursSinceLastOpen >= 48 && !(await this.hasSentEngagementReminder('48hour'))) {
      await this.sendEngagementNotification('48hour');
    } else if (hoursSinceLastOpen >= 168 && !(await this.hasSentEngagementReminder('weekly'))) { // 7 days
      await this.sendEngagementNotification('weekly');
    }
  }

  async sendEngagementNotification(type) {
    const messages = {
      '48hour': {
        title: "We miss you! 👋",
        body: "Check out new arrivals and exclusive deals waiting for you!"
      },
      'weekly': {
        title: "Special offers inside! 🎁",
        body: "Don't miss out on limited-time deals and new product launches!"
      }
    };

    const message = messages[type];

    // Send local notification
    await notificationService.sendLocalNotification(message.title, message.body, {
      type: 'engagement',
      engagementType: type
    });

    // Send server notification
    await this.sendServerNotification({
      endpoint: '/notifications/send',
      data: {
        title: message.title,
        body: message.body,
        type: 'promotion',
        data: { engagementType: type }
      }
    });

    // Mark as sent
    await AsyncStorage.setItem(`@engagement_reminder_${type}`, new Date().toISOString());
    console.log(`✅ Engagement notification sent: ${type}`);
  }

  /**
   * 📱 APP STATE HANDLERS
   * Handle app state changes for tracking and cleanup
   */
  async setupAppStateHandlers() {
    // Track app opens/closes
    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        await AsyncStorage.setItem('@last_app_open', new Date().toISOString());
        // Clear cart abandonment timers when user returns
        await this.clearCartAbandonmentTimers();
      } else if (nextAppState === 'background') {
        // Update cart timestamp when user leaves
        await AsyncStorage.setItem('@last_cart_update', new Date().toISOString());
      }
    });

    console.log('📱 App state handlers set up');
  }

  /**
   * 🔧 UTILITY METHODS
   */

  async sendServerNotification({ endpoint, data }) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
      const { token: userToken } = JSON.parse(userData);
      if (!userToken) return;

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Server notification sent successfully');
      }
    } catch (error) {
      console.error('❌ Server notification failed:', error);
    }
  }

  async hasSentReminder(reminderType) {
    const lastSent = await AsyncStorage.getItem(`@cart_reminder_${reminderType}`);
    if (!lastSent) return false;

    const hoursSinceLastSent = (new Date() - new Date(lastSent)) / (1000 * 60 * 60);
    return hoursSinceLastSent < 24; // Don't send same reminder within 24 hours
  }

  async hasSentEngagementReminder(type) {
    const lastSent = await AsyncStorage.getItem(`@engagement_reminder_${type}`);
    if (!lastSent) return false;

    const hoursSinceLastSent = (new Date() - new Date(lastSent)) / (1000 * 60 * 60);
    return hoursSinceLastSent < 48; // Don't send same engagement reminder within 48 hours
  }

  async clearCartAbandonmentTimers() {
    const reminderTypes = ['30min', '2hour', '24hour'];
    for (const type of reminderTypes) {
      await AsyncStorage.removeItem(`@cart_reminder_${type}`);
    }
  }

  async wasProductOutOfStock(productId) {
    const outOfStockItems = await AsyncStorage.getItem('@out_of_stock_items');
    const items = outOfStockItems ? JSON.parse(outOfStockItems) : [];
    return items.includes(productId);
  }

  async markProductOutOfStock(productId) {
    const outOfStockItems = await AsyncStorage.getItem('@out_of_stock_items');
    const items = outOfStockItems ? JSON.parse(outOfStockItems) : [];
    if (!items.includes(productId)) {
      items.push(productId);
      await AsyncStorage.setItem('@out_of_stock_items', JSON.stringify(items));
    }
  }

  async markProductInStock(productId) {
    const outOfStockItems = await AsyncStorage.getItem('@out_of_stock_items');
    const items = outOfStockItems ? JSON.parse(outOfStockItems) : [];
    const updatedItems = items.filter(id => id !== productId);
    await AsyncStorage.setItem('@out_of_stock_items', JSON.stringify(updatedItems));
  }

  /**
   * 🧹 CLEANUP
   */
  cleanup() {
    console.log('🧹 Cleaning up automated notification system...');
    
    // Clear all intervals
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();

    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    this.isInitialized = false;
    console.log('✅ Automated system cleaned up');
  }
}

export default new AutomatedNotificationSystem();
