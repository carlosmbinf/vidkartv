import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TVPoster } from "./TVPoster";
import { getSeriesImageUrl } from "../services/images";
import { tvTokens } from "../theme";
import type { Series } from "../types/series";

const list = (value: string[] | string | undefined) =>
  Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

export function SeriesCard({
  series,
  onPress,
  onFocusItem,
  preferred = false,
}: {
  series: Series;
  onPress: () => void;
  onFocusItem?: (series: Series) => void;
  preferred?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const genres = list(series.clasificacion).slice(0, 2).join(" · ");
  const imageUri = getSeriesImageUrl(series);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={preferred}
      onPress={onPress}
      onFocus={() => {
        setFocused(true);
        onFocusItem?.(series);
      }}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.card,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${series.nombre || "serie"}`}
    >
      <View style={styles.posterWrap}>
        <TVPoster
          uri={imageUri}
          style={styles.poster}
        />
        <LinearGradient
          colors={["rgba(8,11,18,0.25)", "rgba(8,11,18,0.05)", "rgba(8,11,18,0.96)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.posterTopRow}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>SERIE</Text>
          </View>
          <Text style={styles.year}>{series.anoLanzamiento || "TV"}</Text>
        </View>
        <View style={styles.posterFooter}>
          <Text numberOfLines={2} style={styles.title}>
            {series.nombre || "Serie sin título"}
          </Text>
          <Text numberOfLines={1} style={styles.genre}>
            {series.anoLanzamiento || "—"}
            {genres ? `  ·  ${genres}` : ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 188,
    height: 116,
    marginRight: 14,
    marginVertical: 6,
    borderRadius: tvTokens.radius.card,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    backgroundColor: tvTokens.colors.surface,
    boxShadow: tvTokens.shadow.card,
  },
  focused: {
    borderColor: "#ffffff",
    boxShadow: "0px 0px 0px 2px rgba(255,255,255,0.95), 0px 9px 20px rgba(129,140,248,0.38)",
    zIndex: 10,
  },
  pressed: {
    opacity: 0.88,
  },
  posterWrap: {
    flex: 1,
    margin: 2,
    overflow: "hidden",
    borderRadius: 11,
    backgroundColor: "#111827",
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterTopRow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeContainer: {
    backgroundColor: "rgba(99,102,241,0.94)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  year: {
    color: "#e2e8f0",
    backgroundColor: "rgba(8,11,18,0.78)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "700",
  },
  posterFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingBottom: 7,
    gap: 2,
  },
  title: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "800",
  },
  genre: {
    color: "#cbd5e1",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "600",
  },
});
