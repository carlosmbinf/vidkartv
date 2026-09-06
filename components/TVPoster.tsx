import { Image as ExpoImage, type ImageContentFit } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

export interface TVPosterProps {
  uri?: string | null;
  fallbackUri?: string | null;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  title?: string;
}

export function TVPoster({
  uri,
  fallbackUri,
  style,
  contentFit = "cover",
  title,
}: TVPosterProps) {
  const [activeUri, setActiveUri] = React.useState<string | null>(uri || fallbackUri || null);
  const [loadFailed, setLoadFailed] = React.useState(false);

  React.useEffect(() => {
    setActiveUri(uri || fallbackUri || null);
    setLoadFailed(false);
  }, [uri, fallbackUri]);

  const handleError = React.useCallback(() => {
    if (activeUri === uri && fallbackUri && fallbackUri !== uri) {
      setActiveUri(fallbackUri);
    } else {
      setLoadFailed(true);
    }
  }, [activeUri, fallbackUri, uri]);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={["#111827", "#1f2937", "#090d16"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {activeUri && !loadFailed ? (
        <ExpoImage
          source={{ uri: activeUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit={contentFit}
          cachePolicy="memory-disk"
          transition={250}
          onError={handleError}
        />
      ) : (
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackBrand}>VIDKAR</Text>
          {title ? (
            <Text numberOfLines={2} style={styles.fallbackTitle}>
              {title}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#111827",
  },
  fallbackContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#131b2e",
  },
  fallbackBrand: {
    color: "#e50914",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
  },
  fallbackTitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
});
