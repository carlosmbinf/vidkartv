const { withAppBuildGradle, withInfoPlist } = require("@expo/config-plugins");
const generateCode = require("@expo/config-plugins/build/utils/generateCode");

const GRADLE_TAG = "withVidkarTvVlc";
const VLC_ANDROID_TASKS = `tasks.whenTaskAdded((tas -> {
        if (tas.name.contains("merge") && tas.name.contains("NativeLibs")) {
                tasks.named(tas.name) { it
                        doFirst {
                                def reactAndroidDir = it.externalLibNativeLibs
                                                .getFiles()
                                                .stream()
                                                .filter(file -> file.toString().contains("jetified-react-android"))
                                                .findAny()
                                                .orElse(null)
                                if (reactAndroidDir != null) {
                                        java.nio.file.Files.walk(reactAndroidDir.toPath()).forEach(file -> {
                                                if (file.toString().contains("libc++_shared.so")) {
                                                        java.nio.file.Files.deleteIfExists(file)
                                                }
                                        })
                                }
                        }
                }
        }
}))`;

module.exports = function withVidkarVlc(config) {
    config = withAppBuildGradle(config, (gradleConfig) => {
        const merged = generateCode.mergeContents({
            tag: GRADLE_TAG,
            src: gradleConfig.modResults.contents,
            newSrc: VLC_ANDROID_TASKS,
            anchor: /autolinkLibrariesWithApp\(\)/i,
            offset: 2,
            comment: "//",
        });

        gradleConfig.modResults.contents = merged.contents;
        return gradleConfig;
    });

    return withInfoPlist(config, (plistConfig) => {
        plistConfig.modResults.NSLocalNetworkUsageDescription =
            plistConfig.modResults.NSLocalNetworkUsageDescription ||
            "VIDKAR necesita acceso a la red local para reproducir contenido multimedia y subtítulos desde servidores compatibles con VLC.";
        return plistConfig;
    });
};
