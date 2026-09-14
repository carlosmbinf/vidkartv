import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TVNavHeader, type TVCatalogTab } from "./TVNavHeader";
import { TVHero } from "./TVHero";
import { MovieCard } from "./MovieCard";
import { SeriesCard } from "./SeriesCard";
import { TVFocusButton } from "./TVFocusButton";
import { TVDetailModal } from "./TVDetailModal";
import CourseCatalog from "./CourseCatalog";
import { PelisCollection, SeriesCollection } from "./collections";
import { Meteor } from "../services/meteor/client";
import { useCurrentSession } from "../services/meteor/session";
import type { Movie } from "../types/movie";
import type { Series, SeriesChapter } from "../types/series";

const ALL_GENRES = "Todos";

const list = (value: string[] | string | undefined) =>
  Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

const selectorForMovies = (query: string, genre: string) => {
  const clauses: any[] = [
    { mostrar: { $in: [true, "true"] } },
    { extension: { $in: ["mkv", "mp4"] } },
  ];
  if (genre !== ALL_GENRES) {
    clauses.push({ clasificacion: { $regex: genre, $options: "i" } });
  }
  if (query.trim()) {
    clauses.push({
      $or: ["nombrePeli", "descripcion", "clasificacion", "actors", "idimdb"].map((field) => ({
        [field]: { $regex: query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
      })),
    });
  }
  return { $and: clauses };
};

export default function MovieCatalog() {
  const router = useRouter();
  const { user: currentUser, userReady } = useCurrentSession();
  const canAccess = currentUser?.subscipcionPelis === true;

  // Pestaña activa: "movies" | "series"
  const [activeTab, setActiveTab] = React.useState<TVCatalogTab>("courses");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState(ALL_GENRES);

  // Elemento enfocado dinámicamente para el Hero
  const [spotlightItem, setSpotlightItem] = React.useState<Movie | Series | null>(null);

  // Modal de detalles
  const [detailItem, setDetailItem] = React.useState<Movie | Series | null>(null);
  const [detailVisible, setDetailVisible] = React.useState(false);

  // 1. Suscripción a Películas
  const movieSelector = React.useMemo(
    () => selectorForMovies(searchQuery, selectedGenre),
    [searchQuery, selectedGenre]
  );

  const { loadingMovies, movies } = Meteor.useTracker(() => {
    if (!canAccess) {
      return { loadingMovies: false, movies: [] as Movie[] };
    }
    if (!Meteor.status().connected) {
      return {
        loadingMovies: true,
        movies: PelisCollection.find({}, { sort: { vistas: -1, nombrePeli: 1 } }).fetch() as Movie[],
      };
    }
    const handle = Meteor.subscribe(
      "pelis",
      movieSelector,
      { sort: { vistas: -1, nombrePeli: 1 }, limit: searchQuery || selectedGenre !== ALL_GENRES ? 240 : 500 }
    );
    return {
      loadingMovies: !handle.ready(),
      movies: PelisCollection.find({}, { sort: { vistas: -1, nombrePeli: 1 } }).fetch() as Movie[],
    };
  }, [canAccess, movieSelector, searchQuery, selectedGenre]);

  const visibleMovies = React.useMemo(
    () =>
      movies.filter(
        (m) =>
          (m.mostrar === true || m.mostrar === "true") &&
          ["mkv", "mp4"].includes(String(m.extension || "").toLowerCase())
      ),
    [movies]
  );

  // 2. Suscripción a Series
  const { loadingSeries, seriesList } = Meteor.useTracker(() => {
    if (!canAccess) {
      return { loadingSeries: false, seriesList: [] as Series[] };
    }
    if (!Meteor.status().connected) {
      return {
        loadingSeries: true,
        seriesList: SeriesCollection.find({}, { sort: { nombre: 1 } }).fetch() as Series[],
      };
    }
    const handle = Meteor.subscribe("series", {}, { sort: { nombre: 1 }, limit: 500 });
    return {
      loadingSeries: !handle.ready(),
      seriesList: SeriesCollection.find({}, { sort: { nombre: 1 } }).fetch() as Series[],
    };
  }, [canAccess]);

  const visibleSeries = React.useMemo(() => {
    const seen = new Set<string>();
    return seriesList.filter(
      (s) =>
        (s.mostrar === true || s.mostrar === "true") &&
        s._id &&
        !seen.has(s._id) &&
        seen.add(s._id)
    );
  }, [seriesList]);

  // Géneros según pestaña
  const genres = React.useMemo(() => {
    const items = activeTab === "movies" ? visibleMovies : visibleSeries;
    const all = items.flatMap((item: any) => list(item.clasificacion));
    return [ALL_GENRES, ...Array.from(new Set(all)).slice(0, 12)];
  }, [activeTab, visibleMovies, visibleSeries]);

  // Filtrado de películas
  const filteredMovies = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return visibleMovies.filter((movie) => {
      const g = list(movie.clasificacion);
      const text = [
        movie.nombrePeli,
        movie.descripcion,
        movie.year,
        g.join(" "),
        list(movie.actors).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (selectedGenre === ALL_GENRES || g.includes(selectedGenre)) && (!query || text.includes(query));
    });
  }, [selectedGenre, searchQuery, visibleMovies]);

  // Filtrado de series
  const filteredSeries = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return visibleSeries.filter((serie) => {
      const g = list(serie.clasificacion);
      const text = [
        serie.nombre,
        serie.descripcion,
        serie.anoLanzamiento,
        g.join(" "),
        list(serie.actors).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (selectedGenre === ALL_GENRES || g.includes(selectedGenre)) && (!query || text.includes(query));
    });
  }, [selectedGenre, searchQuery, visibleSeries]);

  // Filas temáticas de Películas
  const movieRows = React.useMemo(() => {
    const base = [
      {
        title: selectedGenre === ALL_GENRES ? "Populares en VIDKAR" : selectedGenre,
        data: filteredMovies.slice(0, 20),
      },
      {
        title: "Agregadas recientemente",
        data: [...filteredMovies]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 20),
      },
    ];
    if (selectedGenre === ALL_GENRES && !searchQuery.trim()) {
      genres.slice(1, 5).forEach((genreItem) => {
        const matches = filteredMovies.filter((m) => list(m.clasificacion).includes(genreItem)).slice(0, 18);
        if (matches.length > 0) {
          base.push({ title: genreItem, data: matches });
        }
      });
    }
    return base.filter((r) => r.data.length > 0);
  }, [filteredMovies, genres, searchQuery, selectedGenre]);

  // Filas temáticas de Series
  const seriesRows = React.useMemo(() => {
    const base = [
      {
        title: selectedGenre === ALL_GENRES ? "Series recomendadas" : selectedGenre,
        data: filteredSeries.slice(0, 20),
      },
      {
        title: "Nuevas temporadas",
        data: [...filteredSeries]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 20),
      },
    ];
    if (selectedGenre === ALL_GENRES && !searchQuery.trim()) {
      genres.slice(1, 5).forEach((genreItem) => {
        const matches = filteredSeries.filter((s) => list(s.clasificacion).includes(genreItem)).slice(0, 18);
        if (matches.length > 0) {
          base.push({ title: genreItem, data: matches });
        }
      });
    }
    return base.filter((r) => r.data.length > 0);
  }, [filteredSeries, genres, searchQuery, selectedGenre]);

  // Contenido destacado actual para el Hero
  const currentHeroItem = React.useMemo(() => {
    if (spotlightItem) return spotlightItem;
    if (activeTab === "movies") return filteredMovies[0] || visibleMovies[0] || null;
    return filteredSeries[0] || visibleSeries[0] || null;
  }, [activeTab, filteredMovies, filteredSeries, spotlightItem, visibleMovies, visibleSeries]);

  // Redirecciones de sesión
  React.useEffect(() => {
    if (!userReady) return;
    if (!currentUser) router.replace("/(auth)/login");
    else if (!canAccess && activeTab !== "courses") setActiveTab("courses");
  }, [activeTab, canAccess, currentUser, router, userReady]);

  // Manejadores de reproducción
  const handlePlayMovie = React.useCallback(
    (movieToPlay: Movie) => {
      router.push({
        pathname: "/(app)/player",
        params: { id: movieToPlay._id, type: "movie", title: movieToPlay.nombrePeli },
      });
    },
    [router]
  );

  const handlePlayChapter = React.useCallback(
    (chap: SeriesChapter, s: Series) => {
      router.push({
        pathname: "/(app)/player",
        params: { id: chap._id, type: "series", title: chap.nombre, seriesTitle: s.nombre },
      });
    },
    [router]
  );

  const handleHeroPlay = React.useCallback(
    (item: Movie | Series) => {
      if (activeTab === "movies") {
        handlePlayMovie(item as Movie);
      } else {
        setDetailItem(item);
        setDetailVisible(true);
      }
    },
    [activeTab, handlePlayMovie]
  );

  const handleOpenDetails = React.useCallback((item: Movie | Series) => {
    setDetailItem(item);
    setDetailVisible(true);
  }, []);

  const handleLogout = React.useCallback(() => {
    Meteor.logout(() => router.replace("/(auth)/login"));
  }, [router]);

  if (!currentUser) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color="#e50914" size="large" />
      </View>
    );
  }

  if (!canAccess || activeTab === "courses") {
    return (
      <View style={styles.screen}>
        <TVNavHeader
          activeTab={activeTab}
          hasMovieSubscription={canAccess}
          onLogout={handleLogout}
          onSearchChange={setSearchQuery}
          onSelectTab={(tab) => {
            if (tab === "courses" || canAccess) setActiveTab(tab);
          }}
          searchQuery={searchQuery}
          username={currentUser?.username || "Usuario"}
        />
        <CourseCatalog query={searchQuery} onQueryChange={setSearchQuery} />
      </View>
    );
  }

  const isLoading = activeTab === "movies" ? loadingMovies : loadingSeries;
  const currentRows = activeTab === "movies" ? movieRows : seriesRows;

  return (
    <View style={styles.screen}>
      {/* Barra de navegación superior TV */}
      <TVNavHeader
        activeTab={activeTab}
        hasMovieSubscription={canAccess}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedGenre(ALL_GENRES);
          setSpotlightItem(null);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
        username={currentUser?.username || "Usuario"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        focusable={false}
      >
        {/* Barra de filtros de géneros */}
        <View style={styles.genreBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreBar}
            focusable={false}
          >
            {genres.map((g, index) => (
              <TVFocusButton
                key={g}
                label={g}
                active={g === selectedGenre}
                onPress={() => setSelectedGenre(g)}
                style={[styles.genreButton, g === selectedGenre && styles.genreButtonActive]}
                hasTVPreferredFocus={index === 0 && Boolean(spotlightItem)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Hero Spotlight Cinematográfico */}
        {currentHeroItem ? (
          <TVHero
            type={activeTab === "movies" ? "movie" : "series"}
            item={currentHeroItem}
            onPlay={handleHeroPlay}
            onDetails={handleOpenDetails}
            hasPreferredFocus={false}
          />
        ) : null}

        {/* Estado de carga */}
        {isLoading && currentRows.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#e50914" size="large" />
            <Text style={styles.loadingText}>
              Cargando catálogo de {activeTab === "movies" ? "películas" : "series"}…
            </Text>
          </View>
        ) : null}

        {/* Sin resultados */}
        {!isLoading && currentRows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No encontramos resultados</Text>
            <Text style={styles.emptySubtitle}>
              Prueba buscando otro título o cambiando el género seleccionado.
            </Text>
          </View>
        ) : null}

        {/* Carruseles horizontales categorizados */}
        {currentRows.map((row, rowIndex) => (
          <View key={row.title} style={styles.rowSection}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            <FlatList
              horizontal
              data={row.data}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
              renderItem={({ item, index }) =>
                activeTab === "movies" ? (
                  <MovieCard
                    movie={item as Movie}
                    onPress={() => handleOpenDetails(item)}
                    onFocusItem={(m) => setSpotlightItem(m)}
                    preferred={rowIndex === 0 && index === 0}
                  />
                ) : (
                  <SeriesCard
                    series={item as Series}
                    onPress={() => handleOpenDetails(item)}
                    onFocusItem={(s) => setSpotlightItem(s)}
                    preferred={rowIndex === 0 && index === 0}
                  />
                )
              }
            />
          </View>
        ))}
      </ScrollView>

      {/* Modal enriquecido de detalles para Películas y Series */}
      <TVDetailModal
        visible={detailVisible}
        type={activeTab === "movies" ? "movie" : "series"}
        item={detailItem}
        onClose={() => setDetailVisible(false)}
        onPlayMovie={handlePlayMovie}
        onPlayChapter={handlePlayChapter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070a11",
  },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#070a11",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  genreBarContainer: {
    paddingVertical: 10,
  },
  genreBar: {
    paddingHorizontal: 48,
    flexDirection: "row",
    gap: 8,
  },
  genreButton: {
    minHeight: 36,
    minWidth: 72,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#111827",
    borderColor: "rgba(148,163,184,0.16)",
  },
  genreButtonActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  rowSection: {
    marginTop: 22,
  },
  rowTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginLeft: 48,
    marginBottom: 10,
  },
  rowContent: {
    paddingLeft: 48,
    paddingRight: 48,
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 16,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 8,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 16,
  },
});

