import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TVPoster } from "./TVPoster";
import { getMoviePosterUrl } from "../services/images";
import { tvTokens } from "../theme";
import type { Movie } from "../types/movie";

const list = (value: string[] | string | undefined) =>
  Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

export function MovieCard({
  movie,
  imageUri,
  onPress,
  onFocusItem,
  preferred = false,
}: {
  movie: Movie;
  imageUri?: string | null;
  onPress: () => void;
  onFocusItem?: (movie: Movie) => void;
  preferred?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const genres = list(movie.clasificacion).slice(0, 2).join(" · ");
  const views = Number(movie.vistas || 0);

  // Usa prioritariamente el endpoint optimizado del servidor backend
  const resolvedUri = imageUri || getMoviePosterUrl(movie._id, "mid");
  const fallbackUri = movie.urlBackgroundHTTPS || movie.urlBackground || null;

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={preferred}
      onPress={onPress}
      onFocus={() => {
        setFocused(true);
        onFocusItem?.(movie);
      }}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.card,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${movie.nombrePeli || "película"}`}
    >
      <View style={styles.posterWrap}>
        <TVPoster
          uri={resolvedUri}
          fallbackUri={fallbackUri}
          style={styles.poster}
        />
        <LinearGradient
          colors={["rgba(8,11,18,0.25)", "rgba(8,11,18,0.05)", "rgba(8,11,18,0.96)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.posterTopRow}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>HD</Text>
          </View>
          {views > 0 ? (
            <Text style={styles.views}>{views.toFixed(0)} vistas</Text>
          ) : (
            <Text style={styles.year}>{movie.year || "Cine"}</Text>
          )}
        </View>
        <View style={styles.posterFooter}>
          <Text numberOfLines={2} style={styles.title}>
            {movie.nombrePeli || "Película sin título"}
          </Text>
          <Text numberOfLines={1} style={styles.genre}>
            {movie.year || "—"}
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
    boxShadow: tvTokens.shadow.focus,
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
    backgroundColor: "rgba(229,9,20,0.92)",
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
  views: {
    color: "#e2e8f0",
    backgroundColor: "rgba(8,11,18,0.78)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 8,
    fontWeight: "700",
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

