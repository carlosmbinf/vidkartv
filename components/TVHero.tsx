import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TVPoster } from "./TVPoster";
import { TVFocusButton } from "./TVFocusButton";
import { getMovieBackdropUrl, getSeriesImageUrl } from "../services/images";
import { tvTokens } from "../theme";
import type { Movie } from "../types/movie";
import type { Series } from "../types/series";

const list = (value: string[] | string | undefined) =>
  Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

export interface TVHeroProps {
  type: "movie" | "series";
  item?: Movie | Series | null;
  onPlay: (item: Movie | Series) => void;
  onDetails: (item: Movie | Series) => void;
  hasPreferredFocus?: boolean;
}

export function TVHero({
  type,
  item,
  onPlay,
  onDetails,
  hasPreferredFocus = false,
}: TVHeroProps) {
  if (!item) return null;

  const isMovie = type === "movie";
  const movie = isMovie ? (item as Movie) : null;
  const series = !isMovie ? (item as Series) : null;

  const title = isMovie ? movie?.nombrePeli : series?.nombre;
  const year = isMovie ? movie?.year : series?.anoLanzamiento;
  const rawDescription = isMovie ? movie?.descripcion : series?.descripcion;
  const description =
    rawDescription && rawDescription !== title
      ? rawDescription
      : "Disponible en alta definición en VIDKAR Cinema TV.";
  const genres = list(isMovie ? movie?.clasificacion : series?.clasificacion).slice(0, 3).join(" · ");
  const views = Number(movie?.vistas || 0);

  const backdropUri = isMovie ? getMovieBackdropUrl(movie, "hig") : getSeriesImageUrl(series);
  const fallbackUri = isMovie
    ? movie?.urlBackgroundHTTPS || movie?.urlBackground || null
    : series?.urlBackgroundHTTPS || series?.urlBackground || null;

  return (
    <View style={styles.heroContainer}>
      <TVPoster
        uri={backdropUri}
        fallbackUri={fallbackUri}
        title={title}
        style={styles.heroBackdrop}
      />

      {/* Gradientes cinemáticos para legibilidad absoluta */}
      <LinearGradient
        colors={["#070a11", "rgba(7,10,17,0.85)", "rgba(7,10,17,0.2)", "transparent"]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["transparent", "rgba(7,10,17,0.5)", "#070a11"]}
        locations={[0, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Contenido textual del Hero */}
      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrowBadge}>
            {isMovie ? "PELÍCULA DESTACADA" : "SERIE RECOMENDADA"}
          </Text>
          <Text style={styles.badgeHD}>1080p HD</Text>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {title || "Contenido destacado"}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{year || "2025"}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{genres || "Cine y Entretenimiento"}</Text>
          {views > 0 ? (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{views.toFixed(0)} visualizaciones</Text>
            </>
          ) : null}
        </View>

        <Text numberOfLines={3} style={styles.description}>
          {description}
        </Text>

        <View style={styles.actionsRow}>
          <TVFocusButton
            label={isMovie ? "▶  Ver película" : "▶  Ver capítulos"}
            variant="primary"
            hasTVPreferredFocus={hasPreferredFocus}
            onPress={() => onPlay(item)}
            style={styles.primaryBtn}
            accessibilityLabel={`Reproducir ${title}`}
          />
          <TVFocusButton
            label="ⓘ  Más detalles"
            variant="secondary"
            onPress={() => onDetails(item)}
            style={styles.secondaryBtn}
            accessibilityLabel={`Ver detalles de ${title}`}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 332,
    marginHorizontal: 48,
    borderRadius: tvTokens.radius.surface,
    overflow: "hidden",
    backgroundColor: "#111827",
    position: "relative",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tvTokens.colors.border,
    boxShadow: tvTokens.shadow.card,
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  content: {
    width: "60%",
    paddingHorizontal: 32,
    paddingVertical: 28,
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  eyebrowBadge: {
    color: "#ff3b45",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  badgeHD: {
    color: "#e2e8f0",
    backgroundColor: "rgba(255,255,255,0.15)",
    fontSize: 9,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    letterSpacing: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 9,
  },
  metaText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  metaDot: {
    color: "#475569",
    fontSize: 14,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  primaryBtn: {
    minWidth: 146,
    minHeight: 44,
  },
  secondaryBtn: {
    minWidth: 138,
    minHeight: 44,
  },
});
