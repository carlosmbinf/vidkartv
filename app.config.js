const baseConfig = {
  name: "VIDKAR TV",
  slug: "vidkar-tv",
  version: "1.0.0",
  orientation: "landscape",
  scheme: "vidkartv",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  icon: "./assets/vidkar-tv-icon.png",
  android: {
    package: "com.vidkar",
    versionCode: 1,
    permissions: ["android.permission.POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "MAIN",
        category: ["LEANBACK_LAUNCHER"],
      },
    ],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-notifications",
    "./plugins/with-vidkar-tv.js",
    "./plugins/with-vidkar-vlc.js",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 36,
          minSdkVersion: 26,
          targetSdkVersion: 36,
          buildToolsVersion: "36.0.0",
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    meteorUrl: "wss://www.vidkar.com/websocket",
    hlsServerUrl: "https://hls.vidkar.com",
    eas: {
      projectId: "",
    },
  },
  ios: {
    bundleIdentifier: "com.vidkar.tv",
  },
};

module.exports = () => ({
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    ...(process.env.CM_BUILD_DIR || process.env.CM_KEYSTORE_PASSWORD || process.env.CM_KEY_ALIAS || process.env.CM_KEY_PASSWORD
      ? [
          [
            "@pksung1/expo-store-signing",
            {
              storeFile: process.env.CM_KEYSTORE_PATH || "/vidkar-android/my-release.jks",
              storePassword: process.env.CM_KEYSTORE_PASSWORD,
              keyAlias: process.env.CM_KEY_ALIAS,
              keyPassword: process.env.CM_KEY_PASSWORD,
            },
          ],
        ]
      : []),
  ],
  extra: {
    ...baseConfig.extra,
    meteorUrl: process.env.EXPO_PUBLIC_METEOR_URL || baseConfig.extra.meteorUrl,
    hlsServerUrl: process.env.EXPO_PUBLIC_HLS_SERVER_URL || baseConfig.extra.hlsServerUrl,
    eas: {
      ...baseConfig.extra.eas,
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || baseConfig.extra.eas.projectId,
    },
  },
});
