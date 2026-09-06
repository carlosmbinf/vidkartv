import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { TVFocusButton } from "./TVFocusButton";
import { SeriesCollection } from "./collections";
import { getMeteorUrl, Meteor } from "../services/meteor/client";
import { useCurrentSession } from "../services/meteor/session";
import { getSeasonChapters, getSeries, getSeriesSeasons } from "../services/series";
import type { Series, SeriesChapter, SeriesSeason } from "../types/series";

const ALL_GENRES = "Todos";

const values = (value: string[] | string | undefined) =>
  Array.isArray(value)
    ? value.map(String).map((item) => item.trim()).filter(Boolean)
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

const isVisible = (series: Series) => series.mostrar === true || series.mostrar === "true";
const titleOf = (series?: Series | null) => series?.nombre || "Serie sin título";
const yearOf = (series?: Series | null) => series?.anoLanzamiento || "Sin año";
const summaryOf = (series?: Series | null) => {
  const description = series?.descripcion?.trim();
  return description && description !== titleOf(series)
    ? description
    : "Descubre temporadas y capítulos disponibles en el catálogo de VIDKAR Cinema.";
};
const imageOf = (series?: Series | null) => {
  const image = series?.urlBackgroundHTTPS || series?.urlBackground;
  return image && /^https?:\/\//i.test(image) ? image : undefined;
};
const numberOf = (chapter?: SeriesChapter | null) => chapter?.capitulo || chapter?.numeroCapitulo || "";
const titleOfChapter = (chapter?: SeriesChapter | null) => chapter?.nombre || "Capítulo sin título";
const errorMessage = (error: any, fallback: string) => error?.reason || error?.message || fallback;

function SeriesCard({ series, onPress, preferred = false }: { series: Series; onPress: () => void; preferred?: boolean }) {
  const [focused, setFocused] = React.useState(false);
  const genres = values(series.clasificacion).slice(0, 2).join(" · ");

  return (
    <Pressable
      accessibilityLabel={`Abrir ${titleOf(series)}`}
      accessibilityRole="button"
      focusable
      hasTVPreferredFocus={preferred}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, focused && styles.cardFocused, pressed && styles.cardPressed]}
    >
      <View style={styles.posterWrap}>
        {imageOf(series) ? <ExpoImage cachePolicy="memory-disk" contentFit="cover" source={{ uri: imageOf(series) }} style={styles.poster} /> : <View style={styles.posterFallback}><Text style={styles.fallbackText}>VIDKAR</Text></View>}
        <LinearGradient colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.14)", "rgba(0,0,0,0.94)"]} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.posterTopRow}><Text style={styles.badge}>SERIE</Text><Text style={styles.year}>{yearOf(series)}</Text></View>
        <View style={styles.posterFooter}><Text numberOfLines={2} style={styles.cardTitle}>{titleOf(series)}</Text><Text numberOfLines={1} style={styles.cardMeta}>{genres || "Catálogo"}</Text></View>
      </View>
    </Pressable>
  );
}

function StateCard({ message, action, loading = false }: { message: string; action?: React.ReactNode; loading?: boolean }) {
  return <View style={styles.state}><View style={styles.stateCard}>{loading ? <ActivityIndicator color="#e50914" size="large" /> : null}<Text style={styles.stateTitle}>{message}</Text>{action}</View></View>;
}

export default function SeriesCatalog() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, userReady } = useCurrentSession();
  const canAccess = user?.subscipcionPelis === true;
  const origin = React.useMemo(() => {
    try {
      const url = new URL(getMeteorUrl());
      return url.hostname === "www.vidkar.com" ? "https://www.vidkar.com" : `${url.protocol === "wss:" || url.protocol === "ws:" ? "https:" : url.protocol}//${url.host}`;
    } catch {
      return "https://www.vidkar.com";
    }
  }, []);
  const [query, setQuery] = React.useState("");
  const [genre, setGenre] = React.useState(ALL_GENRES);
  const [selected, setSelected] = React.useState<Series | null>(null);
  const [detail, setDetail] = React.useState<Series | null>(null);
  const [seasons, setSeasons] = React.useState<SeriesSeason[]>([]);
  const [chaptersBySeason, setChaptersBySeason] = React.useState<Record<string, SeriesChapter[]>>({});
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [chapterLoading, setChapterLoading] = React.useState<string | null>(null);
  const [detailError, setDetailError] = React.useState("");

  const { loading, series } = Meteor.useTracker(() => {
    if (!userReady || !canAccess || !Meteor.status().connected) {
      return { loading: true, series: SeriesCollection.find({}, { sort: { nombre: 1 } }).fetch() as Series[] };
    }
    const handle = Meteor.subscribe("series", {}, { sort: { nombre: 1 }, limit: 1000 });
    return { loading: !handle.ready(), series: SeriesCollection.find({}, { sort: { nombre: 1 } }).fetch() as Series[] };
  });

  const visibleSeries = React.useMemo(() => {
    const seen = new Set<string>();
    return series.filter((item) => isVisible(item) && item._id && !seen.has(item._id) && seen.add(item._id));
  }, [series]);
  const genres = React.useMemo(() => [ALL_GENRES, ...Array.from(new Set(visibleSeries.flatMap((item) => values(item.clasificacion)))).slice(0, 12)], [visibleSeries]);
  const filteredSeries = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return visibleSeries.filter((item) => {
      const itemGenres = values(item.clasificacion);
      const text = [item.nombre, item.descripcion, item.anoLanzamiento, itemGenres.join(" "), values(item.actors).join(" ")].filter(Boolean).join(" ").toLowerCase();
      return (genre === ALL_GENRES || itemGenres.includes(genre)) && (!normalizedQuery || text.includes(normalizedQuery));
    });
  }, [genre, query, visibleSeries]);
  const featured = filteredSeries[0] || visibleSeries[0];
  const rows = React.useMemo(() => {
    const result: { title: string; data: Series[] }[] = [
      { title: genre === ALL_GENRES ? "Para descubrir" : genre, data: filteredSeries.slice(0, 18) },
      { title: "Agregadas recientemente", data: [...filteredSeries].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 18) },
    ];
    if (genre === ALL_GENRES && !query.trim()) {
      genres.slice(1, 5).forEach((item) => result.push({ title: item, data: filteredSeries.filter((seriesItem) => values(seriesItem.clasificacion).includes(item)).slice(0, 18) }));
    }
    return result.filter((row) => row.data.length);
  }, [filteredSeries, genre, genres, query]);

  React.useEffect(() => {
    if (!userReady) return;
    if (!user) router.replace("/(auth)/login");
    else if (!canAccess) router.replace("/(app)/subscription");
  }, [canAccess, router, user, userReady]);

  React.useEffect(() => {
    if (!selected?._id) return undefined;
    let cancelled = false;
    setDetail(selected);
    setSeasons([]);
    setChaptersBySeason({});
    setDetailError("");
    setDetailLoading(true);
    Promise.all([getSeries(selected._id), getSeriesSeasons(selected._id)])
      .then(([nextDetail, nextSeasons]) => {
        if (cancelled) return;
        setDetail(nextDetail || selected);
        setSeasons(Array.isArray(nextSeasons) ? nextSeasons : []);
      })
      .catch((error) => {
        if (!cancelled) setDetailError(errorMessage(error, "No se pudo cargar el detalle de la serie."));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => { cancelled = true; };
  }, [selected]);

  const openDetails = (seriesItem: Series) => setSelected(seriesItem);
  const closeDetails = () => { setSelected(null); setDetail(null); setSeasons([]); setChaptersBySeason({}); setDetailError(""); };
  const loadChapters = (seasonId: string) => {
    if (!seasonId || chaptersBySeason[seasonId]) return;
    setChapterLoading(seasonId);
    getSeasonChapters(seasonId)
      .then((chapters) => setChaptersBySeason((current) => ({ ...current, [seasonId]: Array.isArray(chapters) ? chapters : [] })))
      .catch((error) => setDetailError(errorMessage(error, "No se pudieron cargar los capítulos.")))
      .finally(() => setChapterLoading(null));
  };
  const playChapter = (chapter: SeriesChapter) => {
    closeDetails();
    router.push({ pathname: "/(app)/player", params: { id: chapter._id } });
  };
  const logout = () => Meteor.logout(() => router.replace("/"));
  const posterUri = imageOf(featured) || (featured?._id ? `${origin}/imagenesSeries?idSerie=${encodeURIComponent(featured._id)}` : undefined);

  if (!userReady || !user) return <StateCard loading message="Preparando la sesión…" />;
  if (!canAccess) return <StateCard message="Necesitas una suscripción de películas para ver Series." action={<TVFocusButton label="Cerrar sesión" onPress={logout} hasTVPreferredFocus />} />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={styles.brand}>VIDKAR</Text><Text style={styles.headerTitle}>CINEMA TV · SERIES</Text></View>
        <View style={styles.headerActions}>
          <TextInput accessibilityLabel="Buscar series" onChangeText={setQuery} placeholder="Buscar serie, género o actor" placeholderTextColor="#72819b" style={styles.search} value={query} />
          <TVFocusButton label="Películas" onPress={() => router.replace("/(app)/home")} style={styles.switchButton} />
          <TVFocusButton label="Salir" onPress={logout} style={styles.logout} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScrollView contentContainerStyle={styles.genreBar} horizontal showsHorizontalScrollIndicator={false}>
          {genres.map((item, index) => <TVFocusButton hasTVPreferredFocus={index === 0} key={item} label={item} onPress={() => setGenre(item)} style={[styles.genreButton, item === genre && styles.genreSelected]} />)}
        </ScrollView>
        {featured ? <View style={styles.hero}>
          {posterUri ? <ExpoImage cachePolicy="memory-disk" contentFit="cover" source={{ uri: posterUri }} style={styles.heroImage} /> : null}
          <LinearGradient colors={["rgba(8,11,18,0.12)", "#080b12"]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.heroContent}><Text style={styles.eyebrow}>VIDKAR ORIGINAL CATALOG</Text><Text numberOfLines={2} style={styles.heroTitle}>{titleOf(featured)}</Text><Text style={styles.meta}>{yearOf(featured)}  ·  {values(featured.clasificacion)[0] || "Serie"}  ·  Temporadas y capítulos</Text><Text numberOfLines={3} style={styles.heroCopy}>{summaryOf(featured)}</Text><View style={styles.actions}><TVFocusButton label="Explorar serie" onPress={() => openDetails(featured)} hasTVPreferredFocus={false} /><TVFocusButton label="Películas" onPress={() => router.replace("/(app)/home")} style={styles.secondaryButton} /></View></View>
        </View> : null}
        {loading && !series.length ? <View style={styles.loading}><ActivityIndicator color="#e50914" size="large" /><Text style={styles.muted}>Cargando catálogo de Series…</Text></View> : null}
        {!loading && !filteredSeries.length ? <Text style={styles.empty}>{query.trim() || genre !== ALL_GENRES ? "No encontramos series con esos filtros." : "No hay series disponibles en este momento."}</Text> : null}
        {rows.map((row) => <View key={row.title} style={styles.row}><Text style={styles.rowTitle}>{row.title}</Text><ScrollView contentContainerStyle={styles.rowContent} horizontal showsHorizontalScrollIndicator={false}>{row.data.map((item, index) => <SeriesCard key={item._id} onPress={() => openDetails(item)} preferred={index === 0 && row === rows[0]} series={item} />)}</ScrollView></View>)}
      </ScrollView>

      <Modal animationType="fade" onRequestClose={closeDetails} transparent visible={Boolean(selected)}>
        <View style={styles.modalBackdrop}><View style={[styles.modal, { width: Math.min(820, Math.max(440, width - 100)) }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalEyebrow}>VIDKAR CINEMA · SERIE</Text><Text style={styles.modalTitle}>{titleOf(detail || selected)}</Text><Text style={styles.modalMeta}>{yearOf(detail || selected)}  ·  {values((detail || selected)?.clasificacion).join(" · ") || "Catálogo"}</Text><Text style={styles.modalCopy}>{summaryOf(detail || selected)}</Text>
            {detailError ? <Text style={styles.error}>{detailError}</Text> : null}
            {detailLoading ? <View style={styles.detailLoading}><ActivityIndicator color="#e50914" /><Text style={styles.muted}>Cargando temporadas…</Text></View> : null}
            {!detailLoading && !seasons.length && !detailError ? <Text style={styles.muted}>No hay temporadas visibles para esta serie.</Text> : null}
            {seasons.map((season) => <View key={season._id} style={styles.seasonBlock}><View style={styles.seasonHeader}><Text style={styles.seasonTitle}>Temporada {season.numeroTemporada || 1}</Text><TVFocusButton label={chaptersBySeason[season._id] ? "Actualizada" : "Cargar capítulos"} onPress={() => loadChapters(season._id)} style={styles.seasonButton} /></View>{chapterLoading === season._id ? <ActivityIndicator color="#e50914" /> : null}{chaptersBySeason[season._id]?.length ? <View style={styles.chapterList}>{chaptersBySeason[season._id].map((chapter) => <TVFocusButton key={chapter._id} label={`${numberOf(chapter) ? `E${String(numberOf(chapter)).padStart(2, "0")} · ` : ""}${titleOfChapter(chapter)}`} onPress={() => playChapter(chapter)} style={styles.chapterButton} />)}</View> : null}{chaptersBySeason[season._id] && !chaptersBySeason[season._id].length ? <Text style={styles.muted}>No hay capítulos visibles.</Text> : null}</View>)}
            <TVFocusButton label="Cerrar" onPress={closeDetails} style={styles.closeButton} hasTVPreferredFocus={!detailLoading && !seasons.length} />
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#080b12" },
  header: { height: 86, paddingHorizontal: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(8,11,18,0.96)" },
  brand: { color: "#fff", fontSize: 25, fontWeight: "900", letterSpacing: 4 },
  headerTitle: { color: "#e50914", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  search: { width: 330, height: 48, borderRadius: 9, paddingHorizontal: 16, color: "#fff", backgroundColor: "#172033", borderColor: "#334155", borderWidth: 1, fontSize: 16 },
  switchButton: { minWidth: 120, minHeight: 46, backgroundColor: "#26344e" },
  logout: { minWidth: 90, minHeight: 46 },
  scroll: { paddingBottom: 70 },
  genreBar: { gap: 12, paddingHorizontal: 48, paddingVertical: 18 },
  genreButton: { minWidth: 90, minHeight: 42, paddingHorizontal: 14, backgroundColor: "#172033" },
  genreSelected: { backgroundColor: "#e50914" },
  hero: { height: 405, marginHorizontal: 48, overflow: "hidden", borderRadius: 18, backgroundColor: "#111827", position: "relative" },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.85 },
  heroContent: { width: "58%", padding: 38, paddingTop: 54 },
  eyebrow: { color: "#ff6b72", fontSize: 14, fontWeight: "800", letterSpacing: 2 },
  heroTitle: { color: "#fff", fontSize: 42, fontWeight: "900", marginTop: 15 },
  meta: { color: "#d4dbea", fontSize: 17, marginTop: 12 },
  heroCopy: { color: "#b7c2d6", fontSize: 18, lineHeight: 27, marginTop: 18 },
  actions: { flexDirection: "row", gap: 14, marginTop: 24 },
  secondaryButton: { backgroundColor: "#26344e" },
  row: { marginTop: 30 },
  rowTitle: { color: "#fff", fontSize: 25, fontWeight: "800", marginLeft: 48, marginBottom: 15 },
  rowContent: { paddingLeft: 48, paddingRight: 48, paddingVertical: 8 },
  card: { width: 188, height: 116, marginRight: 14, marginVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: "rgba(148,163,184,0.12)", backgroundColor: "#111827", boxShadow: "0px 5px 14px rgba(0, 0, 0, 0.24)" },
  cardFocused: { borderColor: "#ffffff", boxShadow: "0px 0px 0px 2px rgba(255,255,255,0.95), 0px 9px 20px rgba(229,9,20,0.42)", zIndex: 10 },
  cardPressed: { opacity: 0.86 },
  posterWrap: { flex: 1, margin: 2, overflow: "hidden", borderRadius: 11, backgroundColor: "#1d293d", position: "relative" },
  poster: { width: "100%", height: "100%" },
  posterFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1d293d" },
  fallbackText: { color: "#64748b", fontSize: 17, fontWeight: "900", letterSpacing: 2 },
  posterTopRow: { position: "absolute", top: 8, left: 8, right: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { color: "#fff", backgroundColor: "rgba(229,9,20,0.86)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, fontSize: 10, fontWeight: "800" },
  year: { color: "#fff", backgroundColor: "rgba(8,11,18,0.78)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, fontSize: 11, fontWeight: "700" },
  posterFooter: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingBottom: 10, gap: 3 },
  cardTitle: { color: "#fff", fontSize: 14, lineHeight: 17, fontWeight: "800" },
  cardMeta: { color: "#d4dbea", fontSize: 11, lineHeight: 14 },
  loading: { alignItems: "center", gap: 12, padding: 48 },
  muted: { color: "#96a4ba", fontSize: 16, lineHeight: 24 },
  empty: { color: "#a9b4c7", fontSize: 20, textAlign: "center", padding: 60 },
  state: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#080b12", padding: 30 },
  stateCard: { alignItems: "center", gap: 16, maxWidth: 560, padding: 28 },
  stateTitle: { color: "#fff", fontSize: 24, fontWeight: "800", textAlign: "center" },
  modalBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: "rgba(0,0,0,0.82)" },
  modal: { maxHeight: "88%", padding: 30, borderRadius: 20, backgroundColor: "#111827", borderColor: "#334155", borderWidth: 1 },
  modalEyebrow: { color: "#ff6b72", fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  modalTitle: { color: "#fff", fontSize: 34, fontWeight: "900", marginTop: 8 },
  modalMeta: { color: "#cbd5e1", fontSize: 17, marginTop: 10 },
  modalCopy: { color: "#c6cede", fontSize: 17, lineHeight: 26, marginTop: 18 },
  detailLoading: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 22 },
  error: { color: "#ffb4ab", fontSize: 16, lineHeight: 23, marginTop: 18 },
  seasonBlock: { marginTop: 20, padding: 18, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.055)", borderColor: "rgba(148,163,184,0.16)", borderWidth: 1 },
  seasonHeader: { alignItems: "center", flexDirection: "row", gap: 18, justifyContent: "space-between" },
  seasonTitle: { color: "#fff", flex: 1, fontSize: 20, fontWeight: "800" },
  seasonButton: { minHeight: 46, backgroundColor: "#26344e" },
  chapterList: { gap: 10, marginTop: 14 },
  chapterButton: { alignItems: "flex-start", minHeight: 50, width: "100%", backgroundColor: "#172033", paddingHorizontal: 18 },
  closeButton: { alignSelf: "flex-end", backgroundColor: "#e50914", marginTop: 24, minWidth: 120 },
});
