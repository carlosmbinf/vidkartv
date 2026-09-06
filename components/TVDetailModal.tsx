import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { TVPoster } from "./TVPoster";
import { TVFocusButton } from "./TVFocusButton";
import { getMovieBackdropUrl, getMoviePosterUrl, getSeriesImageUrl, getChapterImageUrl } from "../services/images";
import { getSeasonChapters, getSeriesSeasons } from "../services/series";
import { tvTokens } from "../theme";
import type { Movie } from "../types/movie";
import type { Series, SeriesChapter, SeriesSeason } from "../types/series";

const list = (value: string[] | string | undefined) =>
  Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

export interface TVDetailModalProps {
  visible: boolean;
  type: "movie" | "series";
  item: Movie | Series | null;
  onClose: () => void;
  onPlayMovie: (movie: Movie) => void;
  onPlayChapter: (chapter: SeriesChapter, series: Series, season: SeriesSeason | null) => void;
}

export function TVDetailModal({
  visible,
  type,
  item,
  onClose,
  onPlayMovie,
  onPlayChapter,
}: TVDetailModalProps) {
  const { width, height } = useWindowDimensions();
  const isMovie = type === "movie";
  const movie = isMovie ? (item as Movie) : null;
  const series = !isMovie ? (item as Series) : null;

  // Estados de series (temporadas y capítulos)
  const [seasons, setSeasons] = React.useState<SeriesSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = React.useState<SeriesSeason | null>(null);
  const [chapters, setChapters] = React.useState<SeriesChapter[]>([]);
  const [loadingSeasons, setLoadingSeasons] = React.useState(false);
  const [loadingChapters, setLoadingChapters] = React.useState(false);

  // Cargar temporadas si es serie
  React.useEffect(() => {
    if (!visible || isMovie || !series?._id) {
      setSeasons([]);
      setSelectedSeason(null);
      setChapters([]);
      return;
    }

    let cancelled = false;
    setLoadingSeasons(true);
    getSeriesSeasons(series._id)
      .then((seasonsList) => {
        if (cancelled) return;
        const validList = Array.isArray(seasonsList) ? seasonsList : [];
        setSeasons(validList);
        if (validList.length > 0) {
          setSelectedSeason(validList[0]);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoadingSeasons(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isMovie, series?._id, visible]);

  // Cargar capítulos cuando cambia la temporada
  React.useEffect(() => {
    if (!selectedSeason?._id) {
      setChapters([]);
      return;
    }

    let cancelled = false;
    setLoadingChapters(true);
    getSeasonChapters(selectedSeason._id)
      .then((chaptersList) => {
        if (cancelled) return;
        setChapters(Array.isArray(chaptersList) ? chaptersList : []);
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoadingChapters(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSeason?._id]);

  if (!item) return null;

  const title = isMovie ? movie?.nombrePeli : series?.nombre;
  const year = isMovie ? movie?.year : series?.anoLanzamiento;
  const genres = list(isMovie ? movie?.clasificacion : series?.clasificacion).join(" · ");
  const actors = list(isMovie ? movie?.actors : series?.actors).join(", ");
  const rawDesc = isMovie ? movie?.descripcion : series?.descripcion;
  const description = rawDesc && rawDesc !== title ? rawDesc : "Disponible en el catálogo de VIDKAR Cinema.";
  const views = Number(movie?.vistas || 0);

  const posterUri = isMovie ? getMoviePosterUrl(movie?._id, "hig") : getSeriesImageUrl(series);
  const backdropUri = isMovie ? getMovieBackdropUrl(movie, "hig") : getSeriesImageUrl(series);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { width: Math.min(1060, width * 0.92), maxHeight: height * 0.88 }]}>
          {/* Fondo difuminado panorámico */}
          <TVPoster uri={backdropUri} style={styles.cardBackdrop} />
          <LinearGradient
            colors={["rgba(15,23,42,0.92)", "rgba(15,23,42,0.98)", "#070a11"]}
            style={StyleSheet.absoluteFillObject}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Cabecera con póster e información */}
            <View style={styles.topSection}>
              <View style={styles.posterContainer}>
                <TVPoster uri={posterUri} title={title} style={styles.poster} />
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.badgeRow}>
                  <Text style={styles.typeBadge}>{isMovie ? "PELÍCULA" : "SERIE"}</Text>
                  <Text style={styles.metaYear}>{year || "2025"}</Text>
                  {views > 0 ? <Text style={styles.metaViews}>{views.toFixed(0)} vistas</Text> : null}
                  <Text style={styles.badgeHD}>1080p</Text>
                </View>

                <Text style={styles.title}>{title || "Sin título"}</Text>

                {genres ? <Text style={styles.genresText}>{genres}</Text> : null}

                <Text style={styles.descriptionText}>{description}</Text>

                {actors ? (
                  <View style={styles.actorsRow}>
                    <Text style={styles.actorsLabel}>Reparto:</Text>
                    <Text numberOfLines={2} style={styles.actorsText}>
                      {actors}
                    </Text>
                  </View>
                ) : null}

                {/* Acciones principales */}
                <View style={styles.mainActions}>
                  {isMovie ? (
                    <TVFocusButton
                      label="▶  Reproducir película"
                      variant="primary"
                      hasTVPreferredFocus
                      onPress={() => {
                        onClose();
                        onPlayMovie(movie!);
                      }}
                      style={styles.actionButton}
                    />
                  ) : null}
                  <TVFocusButton
                    label="Volver"
                    variant="secondary"
                    onPress={onClose}
                    hasTVPreferredFocus={!isMovie}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </View>

            {/* Si es serie, selector de temporadas y lista de capítulos */}
            {!isMovie ? (
              <View style={styles.seriesSection}>
                <Text style={styles.sectionTitle}>Temporadas y Capítulos</Text>

                {/* Selector de temporadas */}
                {loadingSeasons ? (
                  <ActivityIndicator color="#e50914" style={{ marginVertical: 12 }} />
                ) : seasons.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonsBar}>
                    {seasons.map((seasonItem) => (
                      <TVFocusButton
                        key={seasonItem._id}
                        label={`Temporada ${seasonItem.numeroTemporada}`}
                        active={selectedSeason?._id === seasonItem._id}
                        onPress={() => setSelectedSeason(seasonItem)}
                        style={styles.seasonButton}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyNote}>No hay temporadas registradas para esta serie.</Text>
                )}

                {/* Lista de capítulos de la temporada seleccionada */}
                {loadingChapters ? (
                  <ActivityIndicator color="#e50914" style={{ marginVertical: 20 }} />
                ) : chapters.length > 0 ? (
                  <View style={styles.chaptersContainer}>
                    {chapters.map((chap) => {
                      const chapNum = chap.capitulo ?? chap.numeroCapitulo ?? 1;
                      const chapTitle = chap.nombre || `Capítulo ${chapNum}`;
                      const chapImg = getChapterImageUrl(chap, series);

                      return (
                        <View key={chap._id} style={styles.chapterCard}>
                          <TVPoster uri={chapImg} style={styles.chapterThumbnail} />
                          <View style={styles.chapterInfo}>
                            <Text style={styles.chapterNumber}>Capítulo {chapNum}</Text>
                            <Text numberOfLines={1} style={styles.chapterTitle}>
                              {chapTitle}
                            </Text>
                            {chap.descripcion ? (
                              <Text numberOfLines={2} style={styles.chapterDesc}>
                                {chap.descripcion}
                              </Text>
                            ) : null}
                          </View>
                          <TVFocusButton
                            label="▶  Ver"
                            variant="primary"
                            onPress={() => {
                              onClose();
                              onPlayChapter(chap, series!, selectedSeason);
                            }}
                            style={styles.playChapterBtn}
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : selectedSeason ? (
                  <Text style={styles.emptyNote}>No hay capítulos disponibles en esta temporada.</Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  modalCard: {
    borderRadius: tvTokens.radius.surface,
    backgroundColor: "#0b0f19",
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    position: "relative",
    boxShadow: tvTokens.shadow.raised,
  },
  cardBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  scrollContent: {
    padding: 28,
  },
  topSection: {
    flexDirection: "row",
    gap: 24,
  },
  posterContainer: {
    width: 168,
    height: 252,
    borderRadius: tvTokens.radius.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  typeBadge: {
    color: "#ffffff",
    backgroundColor: "#e50914",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaYear: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  metaViews: {
    color: "#94a3b8",
    fontSize: 13,
  },
  badgeHD: {
    color: "#94a3b8",
    borderColor: "#475569",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "800",
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  genresText: {
    color: "#e50914",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  descriptionText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  actorsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 14,
  },
  actorsLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  actorsText: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 18,
  },
  mainActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    minWidth: 128,
    minHeight: 42,
  },
  seriesSection: {
    marginTop: 26,
    borderTopWidth: 1,
    borderTopColor: "rgba(51,65,85,0.4)",
    paddingTop: 18,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },
  seasonsBar: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 12,
  },
  seasonButton: {
    minWidth: 126,
  },
  chaptersContainer: {
    gap: 8,
    marginTop: 8,
  },
  chapterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.6)",
    borderRadius: 14,
    borderColor: "#1e293b",
    borderWidth: 1,
    padding: 10,
    gap: 12,
    boxShadow: tvTokens.shadow.card,
  },
  chapterThumbnail: {
    width: 108,
    height: 64,
    borderRadius: 8,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    color: "#e50914",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  chapterTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  chapterDesc: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  playChapterBtn: {
    minWidth: 78,
  },
  emptyNote: {
    color: "#64748b",
    fontSize: 15,
    fontStyle: "italic",
    paddingVertical: 12,
  },
});
