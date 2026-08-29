// src/utils/notifications.ts
import { API_BASE } from '../config';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function checkNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function enableBrowserNotifications(vapidPublicKey?: string): Promise<boolean> {
  if (!checkNotificationSupport()) {
    console.warn('Web push notifications not supported on this browser.');
    return false;
  }

  const key = vapidPublicKey || import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BOK-uyW0vW4vgQ_rSJO6qjTEz5aBgLDkfF3FUjSLBtwgYvno5y96beTCeXnBwVnOm2raeXcUcpBCXjnvSSRr9R4';

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;

    const res = await fetch(`${API_BASE}/api/notifications/push-subscribe`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    return res.ok;
  } catch (err) {
    console.error('Error enabling browser push notifications:', err);
    return false;
  }
}
