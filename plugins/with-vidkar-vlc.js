const { withAppBuildGradle, withInfoPlist } = require("@expo/config-plugins");

const GRADLE_TAG = "withVidkarTvVlc";

module.exports = function withVidkarVlc(config) {
    config = withAppBuildGradle(config, (gradleConfig) => {
        const legacyBlock = new RegExp(
            `\\s*// @generated begin ${GRADLE_TAG}[\\s\\S]*?// @generated end ${GRADLE_TAG}\\s*`,
            "g"
        );

        gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(legacyBlock, "\n");
        return gradleConfig;
    });

    return withInfoPlist(config, (plistConfig) => {
        plistConfig.modResults.NSLocalNetworkUsageDescription =
            plistConfig.modResults.NSLocalNetworkUsageDescription ||
            "VIDKAR necesita acceso a la red local para reproducir contenido multimedia y subtítulos desde servidores compatibles con VLC.";
        return plistConfig;
    });
};
