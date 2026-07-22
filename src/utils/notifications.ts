import { getFormattedNetworkTime } from './time';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  readBy: string[]; // usernames who marked this as read
  targetRole?: string;
  targetUsername?: string;
  targetLocation?: string;
}

export const getNotifications = (username: string, role: string, location?: string): AppNotification[] => {
  const data = localStorage.getItem('lobbyapp_notifications');
  if (!data) return [];
  try {
    const list = JSON.parse(data) as AppNotification[];
    return list.filter(n => {
      // Filter by target role if specified
      if (n.targetRole && n.targetRole !== role) return false;
      // Filter by target username if specified
      if (n.targetUsername && n.targetUsername !== username) return false;
      // Filter by target location if specified
      if (n.targetLocation && n.targetLocation !== location) return false;
      
      return true;
    });
  } catch {
    return [];
  }
};

export const addNotification = (
  title: string,
  description: string,
  targets: { role?: string; username?: string; location?: string }
) => {
  const data = localStorage.getItem('lobbyapp_notifications');
  let list: AppNotification[] = [];
  if (data) {
    try {
      list = JSON.parse(data);
    } catch {
      list = [];
    }
  }

  // Create clean formatted timestamp using Bogota network time
  const timeFormatted = getFormattedNetworkTime();

  const newNotif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title,
    description,
    time: timeFormatted,
    readBy: [],
    targetRole: targets.role,
    targetUsername: targets.username,
    targetLocation: targets.location
  };

  list.unshift(newNotif);
  localStorage.setItem('lobbyapp_notifications', JSON.stringify(list));
  
  // Dispatch local window storage event to force re-render across views
  window.dispatchEvent(new Event('storage'));
};

export const markAllNotificationsAsRead = (username: string, role: string, location?: string) => {
  const data = localStorage.getItem('lobbyapp_notifications');
  if (!data) return;
  try {
    const list = JSON.parse(data) as AppNotification[];
    const updated = list.map(n => {
      // If it belongs to this user, add their username to readBy list
      const matchesRole = !n.targetRole || n.targetRole === role;
      const matchesUsername = !n.targetUsername || n.targetUsername === username;
      const matchesLocation = !n.targetLocation || n.targetLocation === location;
      
      if (matchesRole && matchesUsername && matchesLocation) {
        if (!n.readBy.includes(username)) {
          return { ...n, readBy: [...n.readBy, username] };
        }
      }
      return n;
    });
    localStorage.setItem('lobbyapp_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error marking notifications as read:', e);
  }
};

export const markNotificationAsRead = (id: string, username: string) => {
  const data = localStorage.getItem('lobbyapp_notifications');
  if (!data) return;
  try {
    const list = JSON.parse(data) as AppNotification[];
    const updated = list.map(n => {
      if (n.id === id) {
        if (!n.readBy.includes(username)) {
          return { ...n, readBy: [...n.readBy, username] };
        }
      }
      return n;
    });
    localStorage.setItem('lobbyapp_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error marking notification as read:', e);
  }
};
