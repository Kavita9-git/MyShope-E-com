/**
 * Real-World Notification Triggers
 * Production-ready notification implementations for e-commerce scenarios
 */

import notificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationTriggers {
  constructor() {
    this.API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://nodejsapp-hfpl.onrender.com/api/v1';
  }

  /**
   * 🛒 E-COMMERCE NOTIFICATION TRIGGERS
   */

  // 1. Order Lifecycle Notifications
  async handleOrderCreated(orderData) {
    try {
      console.log('🎉 Triggering order confirmation notification for order:', orderData._id);
      
      // Send immediate confirmation notification
      await notificationService.sendLocalNotification(
        'Order Confirmed! 🎉',
        `Your order #${orderData.orderNumber || 'NEW'} for $${orderData.totalAmount?.toFixed(2) || '0.00'} has been placed successfully. You'll receive updates as we process your order.`,
        {
          type: 'order_confirmation',
          orderId: orderData._id,
          orderNumber: orderData.orderNumber,
          orderTotal: orderData.totalAmount,
          itemCount: orderData.orderItems?.length || 0,
          timestamp: new Date().toISOString()
        }
      );

      // Also send to server for user's notification history
      await this.sendServerNotification({
        userId: orderData.userId,
        title: 'Order Confirmed! 🎉',
        message: `Your order #${orderData.orderNumber} is confirmed`,
        type: 'order_confirmation',
        data: {
          orderId: orderData._id,
          orderTotal: orderData.totalAmount
        }
      });

      console.log('✅ Order confirmation notifications sent');
    } catch (error) {
      console.error('❌ Error sending order confirmation:', error);
    }
  }

  async handleOrderStatusUpdate(orderId, newStatus, orderData) {
    try {
      const statusMessages = {
        processing: {
          title: 'Order Being Prepared 📦',
          message: 'Great news! We\'re preparing your order for shipment.'
        },
        shipped: {
          title: 'Order Shipped! 🚚',
          message: 'Your order is on the way! Track your package for real-time updates.'
        },
        delivered: {
          title: 'Order Delivered! ✅',
          message: 'Your order has been delivered successfully. Enjoy your purchase!'
        },
        cancelled: {
          title: 'Order Cancelled',
          message: 'Your order has been cancelled. Refund will be processed within 5-7 business days.'
        }
      };

      const statusInfo = statusMessages[newStatus];
      if (!statusInfo) return;

      await notificationService.sendLocalNotification(
        statusInfo.title,
        statusInfo.message,
        {
          type: 'order_update',
          orderId: orderId,
          status: newStatus,
          orderNumber: orderData?.orderNumber
        }
      );

      console.log(`✅ Order status notification sent: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error sending order status update:', error);
    }
  }

  // 2. Cart Abandonment Recovery (Enhanced)
  async setupCartAbandonmentTracking(cartItems, userId) {
    try {
      // Clear any existing abandonment timer
      const existingTimer = await AsyncStorage.getItem('@cart_abandonment_timer');
      if (existingTimer) {
        clearTimeout(parseInt(existingTimer));
      }

      // Only set up if cart has items
      if (!cartItems || cartItems.length === 0) return;

      // Set up progressive reminders: 30 minutes, 2 hours, 24 hours
      const timers = [
        { delay: 30 * 60 * 1000, type: 'immediate' }, // 30 minutes
        { delay: 2 * 60 * 60 * 1000, type: 'urgent' },   // 2 hours
        { delay: 24 * 60 * 60 * 1000, type: 'final' }    // 24 hours
      ];

      timers.forEach((timer, index) => {
        const timerId = setTimeout(async () => {
          await this.sendCartAbandonmentReminder(cartItems, userId, timer.type, index + 1);
        }, timer.delay);

        // Store timer ID for cleanup
        AsyncStorage.setItem(`@cart_timer_${index}`, timerId.toString());
      });

      console.log('🛒 Cart abandonment tracking set up for', cartItems.length, 'items');
    } catch (error) {
      console.error('❌ Error setting up cart abandonment:', error);
    }
  }

  async sendCartAbandonmentReminder(cartItems, userId, reminderType, sequence) {
    try {
      // Check if cart is still abandoned (user hasn't completed purchase)
      const currentCart = await this.getCurrentCartItems();
      if (!currentCart || currentCart.length === 0) {
        console.log('🛒 Cart no longer abandoned, skipping reminder');
        return;
      }

      const itemNames = cartItems.slice(0, 3).map(item => item.name).join(', ');
      const moreItems = cartItems.length > 3 ? ` and ${cartItems.length - 3} more items` : '';
      const totalValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const messages = {
        immediate: {
          title: "Don't forget your cart! 🛒",
          message: `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} waiting: ${itemNames}${moreItems}. Complete your purchase now!`
        },
        urgent: {
          title: "Items in your cart are popular! 🔥",
          message: `${itemNames}${moreItems} might sell out soon. Secure your items now for $${totalValue.toFixed(2)}!`
        },
        final: {
          title: "Last chance for your cart items! ⏰",
          message: `We're holding ${itemNames}${moreItems} for you. Complete your order before they're gone!`
        }
      };

      const messageInfo = messages[reminderType] || messages.immediate;

      await notificationService.sendLocalNotification(
        messageInfo.title,
        messageInfo.message,
        {
          type: 'cart_abandonment',
          cartItems: cartItems.map(item => ({ 
            id: item._id, 
            name: item.name, 
            price: item.price 
          })),
          totalValue: totalValue,
          reminderType: reminderType,
          sequence: sequence
        }
      );

      console.log(`✅ Cart abandonment reminder sent (${reminderType}, sequence ${sequence})`);
    } catch (error) {
      console.error('❌ Error sending cart abandonment reminder:', error);
    }
  }

  // 3. Wishlist & Price Monitoring
  async monitorWishlistPrices(userId, wishlistItems) {
    try {
      if (!wishlistItems || wishlistItems.length === 0) return;

      // Get stored price history
      const priceHistory = await AsyncStorage.getItem('@price_history');
      const storedPrices = priceHistory ? JSON.parse(priceHistory) : {};

      for (const item of wishlistItems) {
        const currentPrice = item.price || item.discountprice;
        const productId = item.productId?._id || item.productId;
        const storedPrice = storedPrices[productId];

        // Check for price drop (minimum 5% decrease)
        if (storedPrice && currentPrice < storedPrice * 0.95) {
          const discountPercent = Math.round(((storedPrice - currentPrice) / storedPrice) * 100);
          
          await notificationService.sendLocalNotification(
            'Price Drop Alert! 📉',
            `${item.name} is now $${currentPrice.toFixed(2)} (was $${storedPrice.toFixed(2)}). Save ${discountPercent}% now!`,
            {
              type: 'price_drop',
              productId: productId,
              productName: item.name,
              oldPrice: storedPrice,
              newPrice: currentPrice,
              discountPercent: discountPercent,
              savings: storedPrice - currentPrice
            }
          );

          console.log(`💰 Price drop notification sent for ${item.name}`);
        }

        // Update price history
        storedPrices[productId] = currentPrice;
      }

      // Save updated price history
      await AsyncStorage.setItem('@price_history', JSON.stringify(storedPrices));
    } catch (error) {
      console.error('❌ Error monitoring wishlist prices:', error);
    }
  }

  async notifyBackInStock(productId, productName, userId) {
    try {
      // Check if we recently sent a stock notification for this product
      const lastNotified = await AsyncStorage.getItem(`@stock_notified_${productId}`);
      const now = Date.now();
      
      // Only send if we haven't sent a notification in the last 24 hours
      if (lastNotified && (now - parseInt(lastNotified)) < 24 * 60 * 60 * 1000) {
        console.log(`🏬 Stock notification recently sent for ${productName}, skipping`);
        return;
      }

      await notificationService.sendLocalNotification(
        'Back in Stock! 🎉',
        `${productName} is now available. Get it before it sells out again!`,
        {
          type: 'back_in_stock',
          productId: productId,
          productName: productName,
          timestamp: new Date().toISOString()
        }
      );

      // Mark as notified
      await AsyncStorage.setItem(`@stock_notified_${productId}`, now.toString());

      console.log(`✅ Back in stock notification sent for ${productName}`);
    } catch (error) {
      console.error('❌ Error sending back in stock notification:', error);
    }
  }

  /**
   * 🎯 MARKETING & ENGAGEMENT NOTIFICATIONS
   */

  // Promotional notifications with user segmentation
  async sendPromotionalNotification(promotion, userSegment = 'all') {
    try {
      // Check user's marketing preferences
      const preferences = await this.getUserPreferences();
      if (!preferences?.marketing?.promotions) {
        console.log('📢 User opted out of promotional notifications');
        return;
      }

      await notificationService.sendLocalNotification(
        promotion.title || 'Special Offer! 🎁',
        promotion.message,
        {
          type: 'promotion',
          promotionId: promotion.id,
          discountCode: promotion.code,
          category: promotion.category,
          expiryDate: promotion.expiryDate
        }
      );

      console.log(`✅ Promotional notification sent: ${promotion.title}`);
    } catch (error) {
      console.error('❌ Error sending promotional notification:', error);
    }
  }

  // New product recommendations
  async sendProductRecommendation(product, reason = 'personalized') {
    try {
      const preferences = await this.getUserPreferences();
      if (!preferences?.marketing?.personalizedRecommendations) return;

      const reasonMessages = {
        personalized: 'Based on your shopping history',
        trending: 'Trending now',
        similar: 'Similar to items you viewed',
        category: 'New in your favorite category'
      };

      await notificationService.sendLocalNotification(
        'You might like this! 💝',
        `${product.name} - ${reasonMessages[reason]}. Starting at $${product.price}`,
        {
          type: 'product_recommendation',
          productId: product._id,
          productName: product.name,
          reason: reason,
          price: product.price
        }
      );

      console.log(`✅ Product recommendation sent: ${product.name}`);
    } catch (error) {
      console.error('❌ Error sending product recommendation:', error);
    }
  }

  /**
   * 📱 UTILITY METHODS
   */

  async getCurrentCartItems() {
    try {
      // This would typically come from your Redux store or API
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('❌ Error getting current cart items:', error);
      return [];
    }
  }

  async getUserPreferences() {
    try {
      const stored = await AsyncStorage.getItem('@notification_preferences');
      return stored ? JSON.parse(stored) : {
        transactional: { orderConfirmation: true, shippingUpdates: true },
        marketing: { promotions: true, personalizedRecommendations: true },
        engagement: { cartReminders: true, wishlistUpdates: true }
      };
    } catch (error) {
      console.error('❌ Error getting user preferences:', error);
      return {};
    }
  }

  async sendServerNotification(notificationData) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;

      const { token } = JSON.parse(userData);

      await fetch(`${this.API_BASE_URL}/notification/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      console.log('✅ Server notification sent');
    } catch (error) {
      console.error('❌ Error sending server notification:', error);
    }
  }

  // Clean up timers and stored data
  async cleanup() {
    try {
      // Clear cart abandonment timers
      for (let i = 0; i < 3; i++) {
        const timerId = await AsyncStorage.getItem(`@cart_timer_${i}`);
        if (timerId) {
          clearTimeout(parseInt(timerId));
          await AsyncStorage.removeItem(`@cart_timer_${i}`);
        }
      }

      console.log('🧹 Notification timers cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  }
}

export default new NotificationTriggers();
