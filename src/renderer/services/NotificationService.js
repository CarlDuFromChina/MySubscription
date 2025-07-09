// 通知服务
class NotificationService {
  constructor() {
    this.checkPermission();
  }

  // 检查通知权限
  checkPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  // 发送通知
  sendNotification(title, body, icon = null) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/static/icons/icon.png'
      });
    }
  }

  // 检查即将到期的订阅并发送通知
  checkExpiringSubscriptions(subscriptions) {
    const today = new Date();
    const expiringSoon = subscriptions.filter(sub => {
      if (!sub.expireDate) return false;
      
      const expireDate = new Date(sub.expireDate);
      const diffTime = expireDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 7 && diffDays > 0; // 7天内到期
    });

    const expired = subscriptions.filter(sub => {
      if (!sub.expireDate) return false;
      return new Date(sub.expireDate) < today;
    });

    // 发送即将到期通知
    if (expiringSoon.length > 0) {
      this.sendNotification(
        '订阅即将到期提醒',
        `您有 ${expiringSoon.length} 个订阅即将在7天内到期，请及时续费。`
      );
    }

    // 发送已过期通知
    if (expired.length > 0) {
      this.sendNotification(
        '订阅已过期提醒',
        `您有 ${expired.length} 个订阅已过期，请尽快处理。`
      );
    }

    return { expiringSoon, expired };
  }

  // 设置定期检查
  startPeriodicCheck(subscriptions, interval = 60000 * 60) { // 默认每小时检查一次
    this.checkExpiringSubscriptions(subscriptions);
    
    setInterval(() => {
      this.checkExpiringSubscriptions(subscriptions);
    }, interval);
  }
}

export default new NotificationService();
