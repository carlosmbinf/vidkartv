import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Meteor } from "../meteor/client";

const CHANNEL_ID = "vidkar-tv-general";
const EXPO_TOKEN_PREFIXES = ["ExponentPushToken[", "ExpoPushToken["];

Notifications.setNotificationHandler({
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
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const registerPushTokenForActiveSession = async () => {
  const userId = Meteor.userId?.();
  const projectId = getProjectId();
  if (!userId || !projectId || !(await requestPermission())) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "VIDKAR TV",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
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
  onNotification?: (notification: Notifications.Notification) => void,
) => {
  const received = Notifications.addNotificationReceivedListener((notification) => {
    onNotification?.(notification);
  });
  const opened = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotification?.(response.notification);
  });

  return () => {
    received.remove();
    opened.remove();
  };
};
