/**
 * Notification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps expo-notifications for local and scheduled push notifications.
 *
 * Web platform: expo-notifications is not supported on web. All functions
 * return gracefully (no-op or false) when running on web.
 *
 * Full production push notifications (APNs / FCM) require:
 *   - EAS Build with proper credentials (app.json / eas.json)
 *   - A backend to store push tokens and send via Expo Push API
 *   - APNs certificate for iOS, google-services.json for Android
 *
 * For MVP: local notifications and scheduled reminders work on device builds.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Platform } from "react-native";

let Notifications: typeof import("expo-notifications") | null = null;

async function getNotifications() {
  if (Platform.OS === "web") return null;
  if (!Notifications) {
    try {
      Notifications = await import("expo-notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch {
      return null;
    }
  }
  return Notifications;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const N = await getNotifications();
  if (!N) return false;
  try {
    // Cast to any to handle API differences between expo-notifications versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await N.getPermissionsAsync() as any;
    if (existing?.granted === true || existing?.status === "granted") return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await N.requestPermissionsAsync() as any;
    return result?.granted === true || result?.status === "granted";
  } catch {
    return false;
  }
}

export async function getExpoPushToken(): Promise<string | null> {
  const N = await getNotifications();
  if (!N) return null;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
    const token = await N.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  const N = await getNotifications();
  if (!N) return;
  try {
    await N.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // fire immediately
    });
  } catch {}
}

/** Schedule a weekly reminder (e.g. every Friday at 09:00 Dubai time) */
export async function scheduleWeeklyReminder(
  identifier: string,
  title: string,
  body: string,
  weekday: number, // 1 = Sunday, 2 = Monday ... 7 = Saturday; 6 = Friday
  hour: number,
): Promise<void> {
  const N = await getNotifications();
  if (!N) return;
  try {
    // Cancel any existing reminder with this ID first
    await N.cancelScheduledNotificationAsync(identifier).catch(() => {});
    await N.scheduleNotificationAsync({
      identifier,
      content: { title, body },
      trigger: {
        type: N.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute: 0,
      },
    });
  } catch {}
}

export async function cancelScheduledNotification(identifier: string): Promise<void> {
  const N = await getNotifications();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(identifier);
  } catch {}
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  const N = await getNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// Reminder identifiers — stable across sessions
export const REMINDER_IDS = {
  weeklyBasket: "mekazon-weekly-basket",
  reorder: "mekazon-reorder",
  freshStock: "mekazon-fresh-stock",
};

export async function syncNotificationSchedules(prefs: {
  weeklyBasket: boolean;
  reorder: boolean;
  freshStock: boolean;
}): Promise<void> {
  if (prefs.weeklyBasket) {
    await scheduleWeeklyReminder(
      REMINDER_IDS.weeklyBasket,
      "Time to restock your home basket",
      "Your weekly Mekazon order — tap to browse",
      6, // Friday
      9,
    );
  } else {
    await cancelScheduledNotification(REMINDER_IDS.weeklyBasket);
  }

  if (prefs.reorder) {
    await scheduleWeeklyReminder(
      REMINDER_IDS.reorder,
      "Running low on essentials?",
      "Check your usual products and reorder",
      4, // Wednesday
      18,
    );
  } else {
    await cancelScheduledNotification(REMINDER_IDS.reorder);
  }

  if (prefs.freshStock) {
    await scheduleWeeklyReminder(
      REMINDER_IDS.freshStock,
      "Fresh stock just arrived",
      "New products for your home country are in",
      2, // Monday
      10,
    );
  } else {
    await cancelScheduledNotification(REMINDER_IDS.freshStock);
  }
}
