import { getNotifications, saveNotifications, getCurrentUser } from './storage.js';

export function initNotifications() {
  const notifications = getNotifications();
  if (notifications.length === 0) {
    saveNotifications([
      { id: 'n1', text: 'Novi predmet je prijavljen u vašem gradu.', time: '2h' },
      { id: 'n2', text: 'Objava o izgubljenom novčaniku ima novi komentar.', time: '1d' }
    ]);
  }
}

export function getNotificationCount() {
  const user = getCurrentUser();
  if (!user) return 0;
  return getNotifications().length;
}

export function getNotificationsForUser() {
  return getNotifications();
}
