import { API } from './api';

const VAPID_PUBLIC_KEY = "BEIik8xOTBCBAl7t6EjVHzB3i-0hTEMfQLcHmFoeMb5omTvhzt11rPcJmco17JP2dkGbVbqHZifH0Bdgz_qkUZs";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web push not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/webpush-sw.js', {
      scope: '/'
    });

    // V4 Fix: Unsubscribe existing to avoid applicationServerKey mismatch error
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to backend
    await API.post('users/web-push/subscribe/', subscription.toJSON());
    console.log('Web Push Subscribed Successfully');
    
  } catch (error) {
    console.error('Web Push Subscription Error:', error);
  }
}
