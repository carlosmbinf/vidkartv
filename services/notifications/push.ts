import Constants from "expo-constants";
import { Platform } from "react-native";
import { Meteor } from "../meteor/client";
import type * as NotificationsModule from "expo-notifications";

const CHANNEL_ID = "vidkar-tv-general";
const EXPO_TOKEN_PREFIXES = ["ExponentPushToken[", "ExpoPushToken["];
type NotificationsApi = typeof NotificationsModule;
type Notification = NotificationsModule.Notification;

const getNotifications = (): NotificationsApi | null => {
  // Expo Go SDK 53+ no longer includes remote notifications. Avoid importing the
  // native module there because even the import itself emits a runtime warning.
  if (Constants.appOwnership === "expo") return null;
  try {
    return require("expo-notifications") as NotificationsApi;
  } catch {
    return null;
  }
};

const notifications = getNotifications();

notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () => {
  const configured =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  return typeof configured === "string" && configured.trim() ? configured.trim() : null;
};

const isExpoToken = (token: unknown): token is string =>
  typeof token === "string" && EXPO_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));

const requestPermission = async () => {
  if (!notifications) return false;
  const current = await notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await notifications.requestPermissionsAsync();
  return requested.granted;
};

export const registerPushTokenForActiveSession = async () => {
  const userId = Meteor.userId?.();
  const projectId = getProjectId();
  if (!notifications || !userId || !projectId || !(await requestPermission())) return null;

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "VIDKAR TV",
      importance: notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const tokenResponse = await notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenResponse?.data;
  if (!isExpoToken(token)) return null;

  await new Promise<void>((resolve, reject) => {
    Meteor.call(
      "push.registerToken",
      {
        platform: `android_tv_expo_${Platform.Version}`,
        provider: "expo",
        token,
        userId,
      },
      (error: unknown) => (error ? reject(error) : resolve()),
    );
  });

  return token;
};

export const setupPushListeners = (
  onNotification?: (notification: Notification) => void,
) => {
  if (!notifications) return () => undefined;
  const received = notifications.addNotificationReceivedListener((notification) => {
    onNotification?.(notification);
  });
  const opened = notifications.addNotificationResponseReceivedListener((response) => {
    onNotification?.(response.notification);
  });

  return () => {
    received.remove();
    opened.remove();
  };
};
