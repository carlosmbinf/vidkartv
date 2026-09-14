const fs = require("fs");
const path = require("path");
const { withAndroidManifest, withDangerousMod, withGradleProperties } = require("@expo/config-plugins");

const addOrReplaceFeature = (features, name, required) => {
  const withoutFeature = features.filter((feature) => feature.$?.["android:name"] !== name);
  withoutFeature.push({
    $: {
      "android:name": name,
      "android:required": required,
    },
  });
  return withoutFeature;
};

module.exports = function withVidkarTv(config) {
  let nextConfig = withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults.manifest;
    let features = manifest["uses-feature"] || [];
    features = addOrReplaceFeature(features, "android.software.leanback", "true");
    features = addOrReplaceFeature(features, "android.hardware.touchscreen", "false");
    manifest["uses-feature"] = features;

    const application = manifest.application?.[0];
    if (application) {
      application.$ = {
        ...application.$,
        "android:banner": "@drawable/vidkar_tv_banner",
      };
    }

    const activities = application?.activity || [];
    activities.forEach((activity) => {
      let mainLauncherFound = false;
      activity["intent-filter"] = (activity["intent-filter"] || []).filter((intentFilter) => {
        const actions = intentFilter.action || [];
        const isMain = actions.some((action) => action.$?.["android:name"] === "android.intent.action.MAIN");
        if (!isMain) return true;
        if (mainLauncherFound) return false;
        mainLauncherFound = true;

        const categories = intentFilter.category || [];
        intentFilter.category = categories.filter(
          (category) => category.$?.["android:name"] !== "android.intent.category.LAUNCHER",
        );
        if (!intentFilter.category.some((category) => category.$?.["android:name"] === "android.intent.category.LEANBACK_LAUNCHER")) {
          intentFilter.category.push({
            $: { "android:name": "android.intent.category.LEANBACK_LAUNCHER" },
          });
        }
        return true;
      });
    });

    return manifestConfig;
  });

  nextConfig = withGradleProperties(nextConfig, (gradleConfig) => {
    const hasWorkletsPickFirst = gradleConfig.modResults.some(
      (property) => property.type === "property" && property.key === "android.packagingOptions.pickFirsts" && property.value.includes("**/libworklets.so"),
    );

    if (!hasWorkletsPickFirst) {
      gradleConfig.modResults.push({
        type: "property",
        key: "android.packagingOptions.pickFirsts",
        value: "**/libworklets.so",
      });
    }

    return gradleConfig;
  });

  nextConfig = withDangerousMod(nextConfig, ["android", async (dangerousConfig) => {
    const projectRoot = dangerousConfig.modRequest.projectRoot;
    const drawableDirectory = path.join(projectRoot, "android", "app", "src", "main", "res", "drawable-xhdpi");
    fs.mkdirSync(drawableDirectory, { recursive: true });
    fs.copyFileSync(
      path.join(projectRoot, "assets", "vidkar-tv-banner.png"),
      path.join(drawableDirectory, "vidkar_tv_banner.png"),
    );
    return dangerousConfig;
  }]);

  return nextConfig;
};
