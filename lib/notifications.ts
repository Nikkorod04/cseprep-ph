import * as Notifications from "expo-notifications";

const REMINDER_ID_KEY = "cseprep.reminder.id";

export async function enableDailyReminder(hour: number): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Oras na para mag-review",
        body: "10 items lang. Kaya mo 'yan.",
        data: { route: "/practice" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
    return true;
  } catch {
    // Expo Go and some devices block local notifications; fail quietly.
    return false;
  }
}

export async function disableDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

export { REMINDER_ID_KEY };
