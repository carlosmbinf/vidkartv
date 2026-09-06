import { getMeteorUrl } from "./meteor/client";
import type { Movie } from "../types/movie";
import type { Series, SeriesChapter } from "../types/series";

/**
 * Deriva el origen HTTP a partir de la URL de conexión WebSocket de Meteor.
 * En producción apunta siempre a https://www.vidkar.com.
 */
export const getHttpOriginFromMeteorUrl = (value?: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    return "https://www.vidkar.com";
  }

  try {
    const parsedUrl = new URL(value.trim());

    if (parsedUrl.hostname === "www.vidkar.com") {
      return "https://www.vidkar.com";
    }

    const protocol = parsedUrl.protocol === "wss:" ? "https:" : "http:";
    return `${protocol}//${parsedUrl.host}`;
  } catch {
    return "https://www.vidkar.com";
  }
};

/**
 * Obtiene la URL optimizada del póster de la película.
 * Replica exactamente la lógica validada del cliente mobile:
 * utiliza el endpoint backend /imagenesPeliculas con compresión Sharp y caché Redis.
 */
export const getMoviePosterUrl = (
  movieId?: string,
  quality: "low" | "mid" | "hig" = "mid"
): string | null => {
  if (!movieId) return null;
  const mediaOrigin = getHttpOriginFromMeteorUrl(getMeteorUrl());
  return `${mediaOrigin}/imagenesPeliculas?calidad=${quality}&idPeli=${encodeURIComponent(movieId)}`;
};

/**
 * Obtiene la URL del backdrop panorámico de alta resolución para el Hero y modales de TV.
 */
export const getMovieBackdropUrl = (
  movie?: Movie | null,
  quality: "mid" | "hig" = "hig"
): string | null => {
  if (!movie) return null;
  if (movie._id) {
    const mediaOrigin = getHttpOriginFromMeteorUrl(getMeteorUrl());
    return `${mediaOrigin}/imagenesPeliculas?calidad=${quality}&idPeli=${encodeURIComponent(movie._id)}`;
  }
  return movie.urlBackgroundHTTPS || movie.urlBackground || null;
};

/**
 * Resuelve la imagen de una serie (póster o backdrop).
 */
export const getSeriesImageUrl = (series?: Series | null): string | null => {
  if (!series) return null;
  const candidate = series.urlBackgroundHTTPS || series.urlBackground;
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }
  return null;
};

/**
 * Resuelve la imagen de un capítulo de serie con fallback a la serie.
 */
export const getChapterImageUrl = (
  chapter?: SeriesChapter | null,
  fallbackSeries?: Series | null
): string | null => {
  if (!chapter) return getSeriesImageUrl(fallbackSeries);
  const candidate = chapter.urlBackgroundHTTPS || chapter.urlBackground;
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }
  return getSeriesImageUrl(fallbackSeries);
};
