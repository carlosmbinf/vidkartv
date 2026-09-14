import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  ActivityIndicator,
  BackHandler,
  DeviceEventEmitter,
  Modal,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TVFocusButton } from "./TVFocusButton";
import { VLCPlayer } from "./VLCPlayer";
import { addMovieView, getMovie } from "../services/movies";
import { addChapterView, prepareChapterPlayback } from "../services/series";
import { getHlsServerUrl, getMeteorUrl, Meteor } from "../services/meteor/client";
import { useCurrentSession } from "../services/meteor/session";
import type { Movie } from "../types/movie";
import type { SeriesChapter, Series, SeriesSeason } from "../types/series";

const MOVIE_CACHE_KEY = "vidkar.moviePlaybackCache.v1";
const SERIES_CACHE_KEY = "vidkar.seriesPlaybackCache.v1";
const RESUME_MIN_SECONDS = 15;
const PROGRESS_SAVE_INTERVAL_SECONDS = 5;
const PLAYBACK_TIMEOUT_MS = 30000;
const CONTROLS_HIDE_MS = 5000;
const HLS_POLL_MS = 2500;
const SUBTITLE_DISABLE_TRACK_ID = -1;
const SUBTITLE_EXTERNAL_TRACK_ID = "external";
const DEFAULT_SUBTITLE_SIZE_ID = "md";
const PLAYER_ERROR = "El servicio de video no está disponible en este momento.";

const BUFFER_OPTIONS = Object.freeze([
  "--network-caching=1500",
  "--live-caching=1500",
  "--file-caching=1200",
  "--disc-caching=1200",
  "--http-reconnect",
  "--avcodec-fast",
]);

const SUBTITLE_SIZE_OPTIONS = Object.freeze([
  { id: "sm", label: "Pequeños", relativeFontSize: 11, textScale: 65 },
  { id: DEFAULT_SUBTITLE_SIZE_ID, label: "Medianos", relativeFontSize: 14, textScale: 82 },
  { id: "lg", label: "Grandes", relativeFontSize: 18, textScale: 100 },
]);
const SUBTITLE_FIELD_CANDIDATES = [
  "subtitulo",
  "subtitle",
  "subtitleUri",
  "subtitleUrl",
  "urlSubtitle",
  "urlSubtitulo",
  "srt",
  "srtUrl",
  "vtt",
  "vttUrl",
  "captions",
  "subtitles",
  "subtitleTracks",
];
const MEDIA_URL_KEYS = ["uri", "url", "src", "path", "file", "location", "link"];

type TextTrack = { id: number; name?: string };
type Playback = { currentTime: number; duration: number };
type HardwareKeyEvent = { eventType?: string; eventKeyAction?: number };

export interface TVPlayerProps {
  type?: "movie" | "series";
  id?: string;
  initialTitle?: string;
}

const getId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

const getHttpOriginFromMeteorUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.hostname === "www.vidkar.com") return "https://www.vidkar.com";
    return `${parsedUrl.protocol === "wss:" ? "https:" : "http:"}//${parsedUrl.host}`;
  } catch {
    return "https://www.vidkar.com";
  }
};

const isAbsoluteMediaUrl = (value: unknown) =>
  typeof value === "string" && /^(https?:|file:|content:|asset:|ms-appx:|ms-appdata:)/i.test(value.trim());

const normalizeMediaUrl = (value: unknown, mediaOrigin: string) => {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmedValue = value.trim();
  if (isAbsoluteMediaUrl(trimmedValue)) return trimmedValue;
  if (trimmedValue.startsWith("/")) return `${mediaOrigin}${trimmedValue}`;
  return `${mediaOrigin}/${trimmedValue.replace(/^\.?\//, "")}`;
};

const extractCandidateString = (value: unknown, depth = 0): string | null => {
  if (depth > 4 || value == null) return null;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = extractCandidateString(item, depth + 1);
      if (candidate) return candidate;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const key of MEDIA_URL_KEYS) {
      const candidate = extractCandidateString((value as Record<string, unknown>)[key], depth + 1);
      if (candidate) return candidate;
    }
    for (const nestedValue of Object.values(value)) {
      const candidate = extractCandidateString(nestedValue, depth + 1);
      if (candidate) return candidate;
    }
  }
  return null;
};

const resolveMovieSubtitleUri = (movie: Movie | null, mediaOrigin: string) => {
  if (movie?._id && (movie.textSubtitle || movie.subtitulo)) {
    return `${mediaOrigin}/getsubtitle?idPeli=${encodeURIComponent(movie._id)}`;
  }
  const source = movie as (Movie & Record<string, unknown>) | null;
  for (const field of SUBTITLE_FIELD_CANDIDATES) {
    const candidate = normalizeMediaUrl(extractCandidateString(source?.[field]), mediaOrigin);
    if (candidate) return candidate;
  }
  return null;
};

async function readProgress(cacheKey: string, id: string) {
  try {
    const value = await SecureStore.getItemAsync(cacheKey);
    const entry = value ? JSON.parse(value)?.[id]?.playback : null;
    return {
      currentTime: Number(entry?.currentTime || 0) * 1000,
      duration: Number(entry?.duration || 0) * 1000,
      completed: Boolean(entry?.completed),
    };
  } catch {
    return { currentTime: 0, duration: 0, completed: false };
  }
}

async function saveProgress(
  cacheKey: string,
  id: string,
  currentTime: number,
  duration: number,
  completed = false
) {
  try {
    const value = await SecureStore.getItemAsync(cacheKey);
    const cache = value ? JSON.parse(value) : {};
    cache[id] = {
      ...(cache[id] || {}),
      playback: {
        currentTime: completed ? 0 : Math.floor(Math.max(0, currentTime) / 1000),
        duration: Math.floor(Math.max(0, duration) / 1000),
        completed,
        updatedAt: new Date().toISOString(),
      },
    };
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(cache));
  } catch {
    // El progreso local no debe interrumpir la reproducción.
  }
}

export default function TVPlayer(props: TVPlayerProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    type?: string | string[];
    title?: string | string[];
  }>();

  const playbackType: "movie" | "series" =
    props.type || (getId(params.type) === "series" ? "series" : "movie");
  const mediaId = props.id || getId(params.id) || "";
  const cacheKey = playbackType === "series" ? SERIES_CACHE_KEY : MOVIE_CACHE_KEY;

  const user = Meteor.useTracker(() => Meteor.user?.());
  const { user: sessionUser, userReady } = useCurrentSession();
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    if (!userReady) return;
    if (!sessionUser) {
      router.replace("/(auth)/login");
      return;
    }
    if (sessionUser.subscipcionPelis !== true) {
      router.replace("/(app)/home");
    }
  }, [router, sessionUser, userReady]);

  // Estados de datos
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [chapter, setChapter] = React.useState<SeriesChapter | null>(null);
  const [series, setSeries] = React.useState<Series | null>(null);
  const [season, setSeason] = React.useState<SeriesSeason | null>(null);

  const [loading, setLoading] = React.useState(Boolean(mediaId));
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [playlistUrl, setPlaylistUrl] = React.useState<string | null>(null);
  const [streamError, setStreamError] = React.useState<string | null>(null);
  const [streamReload, setStreamReload] = React.useState(0);

  // Estados de reproducción
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [buffering, setBuffering] = React.useState(true);
  const [hasRenderedFrame, setHasRenderedFrame] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playerError, setPlayerError] = React.useState<string | null>(null);
  const [videoInfo, setVideoInfo] = React.useState<{ textTracks?: TextTrack[] } | null>(null);

  // Reanudar y tiempo inicial
  const [resume, setResume] = React.useState<Playback | null>(null);
  const [resumeReady, setResumeReady] = React.useState(false);
  const [startAt, setStartAt] = React.useState(0);

  // Controles y subtítulos
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const [subtitleDialogVisible, setSubtitleDialogVisible] = React.useState(false);
  const [selectedTextTrack, setSelectedTextTrack] = React.useState<number | undefined>();
  const [externalSubtitleEnabled, setExternalSubtitleEnabled] = React.useState(true);
  const [subtitleSizeId, setSubtitleSizeId] = React.useState(DEFAULT_SUBTITLE_SIZE_ID);

  const currentTimeRef = React.useRef(0);
  const durationRef = React.useRef(0);
  const lastSavedRef = React.useRef(0);
  const viewsRegisteredRef = React.useRef(false);
  const cancelUrlRef = React.useRef<string | null>(null);
  const playerRef = React.useRef<any>(null);
  const interruptionTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Título e información
  const title = React.useMemo(() => {
    if (playbackType === "series") {
      const chapterTitle = chapter?.nombre || "Capítulo";
      const seriesTitle = series?.nombre || "Serie";
      const seasonNum = season?.numeroTemporada ?? 1;
      const chapterNum = chapter?.capitulo ?? chapter?.numeroCapitulo ?? 1;
      return `${seriesTitle} · T${seasonNum} E${chapterNum} · ${chapterTitle}`;
    }
    return movie?.nombrePeli || (getId(params.title) as string) || "Película";
  }, [chapter, movie, params.title, playbackType, season, series]);

  // Subtítulos
  const subtitleUri = React.useMemo(() => {
    const hlsOrigin = getHlsServerUrl() || getHttpOriginFromMeteorUrl(getMeteorUrl());
    if (playbackType === "series") {
      return mediaId ? joinUrl(hlsOrigin, `/getsubtitleSeries?idCapitulo=${encodeURIComponent(mediaId)}`) : undefined;
    }
    return resolveMovieSubtitleUri(movie, hlsOrigin) || undefined;
  }, [mediaId, movie, playbackType]);

  const availableTracks = Array.isArray(videoInfo?.textTracks)
    ? videoInfo.textTracks.filter((track) => typeof track?.id === "number")
    : [];
  const selectableTracks = availableTracks.filter((track) => track.id !== SUBTITLE_DISABLE_TRACK_ID);
  const hasSubtitle = Boolean(subtitleUri || selectableTracks.length);

  React.useEffect(() => {
    if (subtitleUri || !selectableTracks.length) return;
    setExternalSubtitleEnabled(false);
    setSelectedTextTrack((current) => current ?? selectableTracks[0].id);
  }, [selectableTracks, subtitleUri]);

  const subtitleSize =
    SUBTITLE_SIZE_OPTIONS.find((option) => option.id === subtitleSizeId) || SUBTITLE_SIZE_OPTIONS[1];

  const source = React.useMemo(() => {
    if (!playlistUrl) return null;
    return {
      uri: playlistUrl,
      initType: 2,
      initOptions: [
        ...BUFFER_OPTIONS,
        `--freetype-rel-fontsize=${subtitleSize.relativeFontSize}`,
        `--sub-text-scale=${subtitleSize.textScale}`,
      ],
      acceptInvalidCertificates: false,
    };
  }, [playlistUrl, subtitleSize.relativeFontSize, subtitleSize.textScale]);

  const progressRatio = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0;

  const clearInterruptionTimer = React.useCallback(() => {
    if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
    interruptionTimerRef.current = null;
  }, []);

  const clearControlsTimer = React.useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = null;
  }, []);

  const persist = React.useCallback(
    (completed = false) => {
      if (!mediaId) return;
      saveProgress(cacheKey, mediaId, currentTimeRef.current, durationRef.current, completed);
      lastSavedRef.current = Math.floor(currentTimeRef.current / 1000);
    },
    [cacheKey, mediaId]
  );

  const handleBack = React.useCallback(() => {
    persist();
    if (cancelUrlRef.current) {
      fetch(cancelUrlRef.current, { method: "POST", keepalive: true }).catch(() => null);
    }
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/home");
  }, [persist, router]);

  const resetControlsTimer = React.useCallback(() => {
    clearControlsTimer();
    if (!source || !isPlaying || paused || playerError || streamError || resume || subtitleDialogVisible) {
      return;
    }
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, [clearControlsTimer, isPlaying, paused, playerError, resume, source, streamError, subtitleDialogVisible]);

  const showControls = React.useCallback(() => {
    if (!source || streamError || playerError || resume || subtitleDialogVisible) return;
    setControlsVisible(true);
    resetControlsTimer();
  }, [playerError, resetControlsTimer, resume, source, streamError, subtitleDialogVisible]);

  const handleHardwareBack = React.useCallback(() => {
    if (subtitleDialogVisible) {
      setSubtitleDialogVisible(false);
      return;
    }
    if (controlsVisible) {
      setControlsVisible(false);
      return;
    }
    handleBack();
  }, [controlsVisible, handleBack, subtitleDialogVisible]);

  // Carga de metadatos del contenido
  React.useEffect(() => {
    if (!userReady || !sessionUser || sessionUser.subscipcionPelis !== true) {
      return undefined;
    }
    if (!mediaId) {
      setLoading(false);
      setLoadError("No se recibió contenido válido para reproducir.");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setPlaylistUrl(null);
    setStreamError(null);
    setStartAt(0);
    setCurrentTime(0);
    setDuration(0);
    setPaused(false);
    setBuffering(true);
    setHasRenderedFrame(false);
    setIsPlaying(false);
    setPlayerError(null);
    setControlsVisible(true);
    setVideoInfo(null);
    setSelectedTextTrack(undefined);
    setExternalSubtitleEnabled(true);
    setSubtitleDialogVisible(false);
    viewsRegisteredRef.current = false;

    if (playbackType === "series") {
      prepareChapterPlayback(mediaId)
        .then((result) => {
          if (cancelled) return;
          if (!result?.chapter) {
            setLoadError("No se pudieron cargar los datos del capítulo.");
            return;
          }
          setChapter(result.chapter);
          setSeries(result.series || null);
          setSeason(result.season || null);
        })
        .catch((err) => {
          if (!cancelled) setLoadError(err?.reason || err?.message || "No fue posible cargar el capítulo.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      getMovie(mediaId)
        .then((value) => {
          if (cancelled) return;
          if (!value) {
            setLoadError("No encontramos los datos de esta película.");
            return;
          }
          setMovie(value);
        })
        .catch(() => {
          if (!cancelled) setLoadError("No fue posible cargar la película.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [mediaId, playbackType, sessionUser, userReady]);

  // Lectura de progreso guardado
  React.useEffect(() => {
    if (!mediaId) return undefined;
    let cancelled = false;
    setResume(null);
    setResumeReady(false);
    readProgress(cacheKey, mediaId).then((entry) => {
      if (cancelled) return;
      const canResume =
        !entry.completed &&
        entry.currentTime >= RESUME_MIN_SECONDS * 1000 &&
        (!entry.duration || entry.currentTime < entry.duration - RESUME_MIN_SECONDS * 1000);
      setResume(canResume ? { currentTime: entry.currentTime, duration: entry.duration } : null);
      setResumeReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, mediaId]);

  // Manejo de botones de control remoto (D-pad)
  React.useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleHardwareBack();
      return true;
    });

    const keySub = DeviceEventEmitter.addListener("onHWKeyEvent", (event: HardwareKeyEvent) => {
      if (event.eventKeyAction !== undefined && event.eventKeyAction !== 0) return;
      const type = event?.eventType || "";
      if (["up", "down", "select", "left", "right", "playPause", "play", "pause"].includes(type)) {
        showControls();
      }
      if (type === "playPause" || type === "play" || type === "pause") {
        setPaused((current) => (type === "play" ? false : type === "pause" ? true : !current));
      }
    });

    return () => {
      backSub.remove();
      keySub.remove();
    };
  }, [handleHardwareBack, showControls]);

  // Sesión HLS: prepare, status polling y cancel
  React.useEffect(() => {
    if (!userReady || !sessionUser || sessionUser.subscipcionPelis !== true || !resumeReady || resume || !mediaId) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const server = getHlsServerUrl();
    const session = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
    const endpoint = playbackType === "series" ? "series" : "peliculas";
    const mediaPath = `/${endpoint}/hls/${encodeURIComponent(mediaId)}`;
    const encodedSession = encodeURIComponent(session);
    const startParam = startAt > 0 ? `&startAt=${Math.floor(startAt / 1000)}` : "";

    const prepareUrl = joinUrl(server, `${mediaPath}/prepare?sessionId=${encodedSession}${startParam}`);
    const statusUrl = joinUrl(server, `${mediaPath}/status?sessionId=${encodedSession}`);
    const cancelUrl = joinUrl(server, `${mediaPath}/${encodedSession}/cancel`);
    const playlistFallback = joinUrl(server, `${mediaPath}/${encodedSession}/index.m3u8`);

    cancelUrlRef.current = cancelUrl;
    setPlaylistUrl(null);
    setStreamError(null);
    setBuffering(true);
    setHasRenderedFrame(false);
    setPlayerError(null);

    const applyStatus = (status: any) => {
      if (status?.durationSeconds > 0) {
        setDuration(Number(status.durationSeconds) * 1000);
      }
      if (status?.playlistReady || status?.ready) {
        const rawUrl = status.playlistUrl;
        const finalUrl = typeof rawUrl === "string" && rawUrl.trim()
          ? (/^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : joinUrl(server, rawUrl.trim()))
          : playlistFallback;
        setPlaylistUrl(finalUrl);
      }
    };

    const poll = async () => {
      if (cancelled) return;
      try {
        const response = await fetch(statusUrl);
        const status = await response.json();
        if (cancelled) return;
        if (!response.ok || status?.success === false || status?.status === "error") {
          throw new Error(status?.error || PLAYER_ERROR);
        }
        applyStatus(status);
        if (!status?.playlistReady && status?.status !== "ready") {
          timer = setTimeout(poll, HLS_POLL_MS);
        }
      } catch (err: any) {
        if (!cancelled) setStreamError(err?.message || PLAYER_ERROR);
      }
    };

    fetch(prepareUrl, { method: "POST" })
      .then(async (response) => {
        const status = await response.json();
        if (cancelled) return;
        if (!response.ok || status?.success === false) {
          throw new Error(status?.error || PLAYER_ERROR);
        }
        applyStatus(status);
        if (!status?.playlistReady && status?.status !== "ready") {
          timer = setTimeout(poll, HLS_POLL_MS);
        }
      })
      .catch((err: any) => {
        if (!cancelled) setStreamError(err?.message || PLAYER_ERROR);
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      fetch(cancelUrl, { method: "POST", keepalive: true }).catch(() => null);
      if (cancelUrlRef.current === cancelUrl) cancelUrlRef.current = null;
    };
  }, [mediaId, playbackType, resume, resumeReady, sessionUser, startAt, streamReload, userReady]);

  // Watchdog de timeout
  React.useEffect(() => {
    clearInterruptionTimer();
    if (!playlistUrl || hasRenderedFrame || playerError || streamError) return undefined;
    interruptionTimerRef.current = setTimeout(() => {
      setBuffering(false);
      setIsPlaying(false);
      setPlayerError(PLAYER_ERROR);
    }, PLAYBACK_TIMEOUT_MS);
    return clearInterruptionTimer;
  }, [clearInterruptionTimer, hasRenderedFrame, playerError, playlistUrl, streamError]);

  // Temporizador de HUD
  React.useEffect(() => {
    clearControlsTimer();
    if (!isPlaying || paused || !controlsVisible || playerError || streamError || resume || subtitleDialogVisible) {
      return undefined;
    }
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
    return clearControlsTimer;
  }, [clearControlsTimer, controlsVisible, isPlaying, paused, playerError, resume, streamError, subtitleDialogVisible]);

  // Guardado periódico de progreso
  React.useEffect(() => {
    currentTimeRef.current = currentTime;
    durationRef.current = duration;
    const seconds = Math.floor(currentTime / 1000);
    if (seconds < RESUME_MIN_SECONDS || Math.abs(seconds - lastSavedRef.current) < PROGRESS_SAVE_INTERVAL_SECONDS) {
      return;
    }
    persist();
  }, [currentTime, duration, persist]);

  // Manejo de eventos de progreso VLC
  const handleProgress = React.useCallback(
    (event: any) => {
      const relativeTime = Number(event?.currentTime || 0);
      const nextDuration = Math.max(durationRef.current, Number(event?.duration || 0));
      const nextTime = Math.max(0, relativeTime + startAt);
      currentTimeRef.current = nextTime;
      durationRef.current = nextDuration;
      setCurrentTime(nextTime);
      setDuration(nextDuration);
      if (relativeTime > 0) {
        clearInterruptionTimer();
        setHasRenderedFrame(true);
        setBuffering(false);
      }
    },
    [clearInterruptionTimer, startAt]
  );

  // Adelanto / Retroceso
  const handleSeek = React.useCallback(
    (deltaSeconds: number) => {
      if (!duration) return;
      const nextTime = clamp(currentTime + deltaSeconds * 1000, 0, duration);
      persist();
      setStartAt(nextTime);
      setStreamReload((val) => val + 1);
      setPlaylistUrl(null);
      setPaused(false);
      setBuffering(true);
      setHasRenderedFrame(false);
      setPlayerError(null);
      setControlsVisible(true);
      setCurrentTime(nextTime);
    },
    [currentTime, duration, persist]
  );

  const handleRetry = React.useCallback(() => {
    setStartAt(0);
    setStreamReload((val) => val + 1);
    setPlaylistUrl(null);
    setStreamError(null);
    setPaused(false);
    setBuffering(true);
    setHasRenderedFrame(false);
    setPlayerError(null);
    setCurrentTime(0);
  }, []);

  const handleSelectTrack = React.useCallback((value: string | number) => {
    if (value === SUBTITLE_EXTERNAL_TRACK_ID) {
      setExternalSubtitleEnabled(true);
      setSelectedTextTrack(undefined);
    } else {
      setExternalSubtitleEnabled(false);
      setSelectedTextTrack(Number(value));
    }
    setSubtitleDialogVisible(false);
  }, []);

  const handleSubtitleSize = React.useCallback(
    (nextId: string) => {
      if (nextId === subtitleSizeId) return;
      setSubtitleSizeId(nextId);
      if (playlistUrl) {
        setStartAt(Math.floor(currentTime / 1000) * 1000);
        setStreamReload((val) => val + 1);
        setPlaylistUrl(null);
        setBuffering(true);
        setHasRenderedFrame(false);
      }
    },
    [currentTime, playlistUrl, subtitleSizeId]
  );

  if (!userReady || !sessionUser || sessionUser.subscipcionPelis !== true) {
    return null;
  }

  if (!user) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator color="#e50914" size="large" />
        <Text style={styles.stateText}>Iniciando sesión segura…</Text>
        <TVFocusButton label="‹  Volver" onPress={handleBack} style={styles.stateButton} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator color="#e50914" size="large" />
        <Text style={styles.stateText}>Preparando contenido…</Text>
        <TVFocusButton label="‹  Volver" onPress={handleBack} style={styles.stateButton} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TVFocusButton label="Reintentar" onPress={handleRetry} variant="primary" hasTVPreferredFocus />
        <TVFocusButton label="‹  Volver" onPress={handleBack} style={styles.stateButton} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.videoFrame}>
        {source ? (
          <VLCPlayer
            key={`${mediaId}:${streamReload}:${subtitleSizeId}`}
            ref={playerRef}
            style={styles.video}
            source={source}
            autoplay
            paused={paused}
            subtitleUri={externalSubtitleEnabled ? subtitleUri : undefined}
            textTrack={!externalSubtitleEnabled && selectedTextTrack !== undefined ? selectedTextTrack : undefined}
            videoAspectRatio="16:9"
            resizeMode="contain"
            acceptInvalidCertificates={false}
            onLoad={(event: any) => {
              const nextDuration = Math.max(durationRef.current, Number(event?.duration || 0));
              setVideoInfo(event);
              setDuration(nextDuration);
              setBuffering(false);
              setPlayerError(null);
              if (!viewsRegisteredRef.current && nextDuration > 0) {
                viewsRegisteredRef.current = true;
                if (playbackType === "series") {
                  addChapterView(mediaId);
                } else {
                  addMovieView(mediaId);
                }
              }
            }}
            onProgress={handleProgress}
            onPlaying={() => {
              clearInterruptionTimer();
              setPaused(false);
              setIsPlaying(true);
              setHasRenderedFrame(true);
              setBuffering(false);
              setPlayerError(null);
            }}
            onPaused={() => {
              setIsPlaying(false);
              setBuffering(false);
            }}
            onBuffering={() => setBuffering(true)}
            onEnd={() => {
              setPaused(true);
              setIsPlaying(false);
              persist(true);
            }}
            onError={() => {
              setIsPlaying(false);
              if (hasRenderedFrame) {
                clearInterruptionTimer();
                setBuffering(false);
                setPlayerError(PLAYER_ERROR);
              }
            }}
          />
        ) : (
          <View style={styles.stateScreen}>
            {streamError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>!</Text>
                <Text style={styles.errorText}>{streamError}</Text>
                <TVFocusButton label="Reintentar" onPress={handleRetry} variant="primary" hasTVPreferredFocus />
                <TVFocusButton label="‹  Volver" onPress={handleBack} style={styles.stateButton} />
              </View>
            ) : (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#e50914" size="large" />
                <Text style={styles.loadingText}>Conectando con el servidor HLS…</Text>
              </View>
            )}
          </View>
        )}

        {/* Loading overlay cuando buferiza */}
        {buffering && source && !playerError && !hasRenderedFrame ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator color="#e50914" size="large" />
            <Text style={styles.loadingText}>Cargando video…</Text>
          </View>
        ) : null}

        {/* HUD de controles para Android TV */}
        {controlsVisible && source && !streamError && !playerError ? (
          <View style={styles.hudOverlay} pointerEvents="box-none">
            {/* Barra superior con título y retroceso */}
            <LinearGradient
              colors={["rgba(8,11,18,0.92)", "rgba(8,11,18,0.4)", "transparent"]}
              style={styles.topHud}
            >
              <TVFocusButton
                label="‹"
                onPress={handleBack}
                style={styles.backButton}
                accessibilityLabel="Volver al catálogo"
              />
              <View style={styles.titleContainer}>
                <Text numberOfLines={1} style={styles.hudTitle}>
                  {title}
                </Text>
                <View style={styles.hudMeta}>
                  <Text style={styles.hudBadge}>
                    {playbackType === "series" ? "SERIE VIDKAR" : "PELÍCULA"}
                  </Text>
                  <Text style={styles.hudTimeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Barra inferior con scrubber y controles */}
            <LinearGradient
              colors={["transparent", "rgba(8,11,18,0.65)", "rgba(8,11,18,0.95)"]}
              style={styles.bottomHud}
            >
              {/* Barra de progreso */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                  <View style={[styles.progressKnob, { left: `${progressRatio * 100}%` }]} />
                </View>
                <Text style={styles.progressTime}>
                  {duration > 0 ? `-${formatTime(Math.max(0, duration - currentTime))}` : "--:--"}
                </Text>
              </View>

              {/* Botones de acción del control remoto */}
              <View style={styles.actionsRow}>
                <TVFocusButton
                  label="↶ 10 s"
                  onPress={() => handleSeek(-10)}
                  style={styles.actionBtn}
                  accessibilityLabel="Retroceder diez segundos"
                />
                <TVFocusButton
                  label={paused ? "▶  Reproducir" : "Ⅱ  Pausar"}
                  onPress={() => setPaused((v) => !v)}
                  variant="primary"
                  hasTVPreferredFocus
                  style={[styles.actionBtn, styles.playBtn]}
                  accessibilityLabel={paused ? "Reproducir" : "Pausar"}
                />
                <TVFocusButton
                  label="10 s ↷"
                  onPress={() => handleSeek(10)}
                  style={styles.actionBtn}
                  accessibilityLabel="Adelantar diez segundos"
                />
                {hasSubtitle ? (
                  <TVFocusButton
                    label="CC Subtítulos"
                    onPress={() => setSubtitleDialogVisible(true)}
                    style={styles.actionBtn}
                    accessibilityLabel="Configurar subtítulos"
                  />
                ) : null}
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {!controlsVisible && source && !streamError && !playerError ? (
          <TVFocusButton
            label={paused ? "▶  Mostrar controles" : "Ⅱ  Mostrar controles"}
            onPress={showControls}
            style={styles.revealControlsButton}
            accessibilityLabel="Mostrar controles de reproducción"
          />
        ) : null}
      </View>

      {/* Modal de reanudar reproducción */}
      <Modal visible={resume !== null} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { width: Math.min(620, width * 0.8) }]}>
            <Text style={styles.modalTitle}>Continuar viendo</Text>
            <Text style={styles.modalCopy}>
              Te quedaste en el minuto {formatTime(resume?.currentTime || 0)}. ¿Deseas continuar desde ese punto?
            </Text>
            <View style={styles.modalActions}>
              <TVFocusButton
                label="Continuar"
                variant="primary"
                hasTVPreferredFocus
                onPress={() => {
                  setStartAt(resume?.currentTime || 0);
                  setResume(null);
                }}
                style={styles.modalBtn}
              />
              <TVFocusButton
                label="Desde el inicio"
                onPress={() => {
                  setStartAt(0);
                  setResume(null);
                }}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de subtítulos */}
      <Modal
        visible={subtitleDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubtitleDialogVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { width: Math.min(640, width * 0.8) }]}>
            <Text style={styles.modalTitle}>Configurar subtítulos</Text>
            <Text style={styles.sectionHeader}>Tamaño del texto</Text>
            <View style={styles.modalActions}>
              {SUBTITLE_SIZE_OPTIONS.map((option) => (
                <TVFocusButton
                  key={option.id}
                  label={option.label}
                  active={option.id === subtitleSizeId}
                  onPress={() => handleSubtitleSize(option.id)}
                  style={styles.sizeBtn}
                />
              ))}
            </View>

            <Text style={styles.sectionHeader}>Pistas disponibles</Text>
            <View style={styles.modalActions}>
              {subtitleUri ? (
                <TVFocusButton
                  label={externalSubtitleEnabled ? "✓ Español (Servidor)" : "Español (Servidor)"}
                  active={externalSubtitleEnabled}
                  onPress={() => handleSelectTrack(SUBTITLE_EXTERNAL_TRACK_ID)}
                  style={styles.trackBtn}
                />
              ) : null}
              {selectableTracks.map((track) => (
                <TVFocusButton
                  key={track.id}
                  label={selectedTextTrack === track.id ? `✓ ${track.name || `Pista ${track.id}`}` : track.name || `Pista ${track.id}`}
                  active={selectedTextTrack === track.id}
                  onPress={() => handleSelectTrack(track.id)}
                  style={styles.trackBtn}
                />
              ))}
              <TVFocusButton
                label={!externalSubtitleEnabled && selectedTextTrack === undefined ? "✓ Desactivados" : "Desactivar"}
                onPress={() => handleSelectTrack(SUBTITLE_DISABLE_TRACK_ID)}
                style={styles.trackBtn}
              />
            </View>

            <TVFocusButton
              label="Cerrar"
              onPress={() => setSubtitleDialogVisible(false)}
              style={styles.closeBtn}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoFrame: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    zIndex: 10,
  },
  topHud: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 36,
    paddingBottom: 24,
    gap: 20,
  },
  backButton: {
    minWidth: 54,
    minHeight: 54,
    borderRadius: 27,
    paddingHorizontal: 0,
  },
  titleContainer: {
    flex: 1,
  },
  hudTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  hudMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  hudBadge: {
    color: "#e50914",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    backgroundColor: "rgba(229,9,20,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hudTimeText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
  },
  bottomHud: {
    paddingHorizontal: 48,
    paddingBottom: 36,
    paddingTop: 30,
    gap: 18,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progressTime: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 64,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#e50914",
  },
  progressKnob: {
    position: "absolute",
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#e50914",
    marginLeft: -8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  revealControlsButton: {
    position: "absolute",
    right: 48,
    bottom: 36,
    minWidth: 190,
    minHeight: 50,
    zIndex: 12,
  },
  actionBtn: {
    minWidth: 120,
    minHeight: 50,
  },
  playBtn: {
    minWidth: 160,
  },
  stateScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#070a11",
    gap: 18,
    padding: 36,
  },
  stateText: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700",
  },
  stateButton: {
    marginTop: 10,
  },
  loadingBox: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    gap: 14,
    zIndex: 5,
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 32,
    borderRadius: 16,
    borderColor: "#334155",
    borderWidth: 1,
    maxWidth: 520,
    gap: 16,
  },
  errorIcon: {
    color: "#e50914",
    fontSize: 38,
    fontWeight: "900",
  },
  errorText: {
    color: "#ff858d",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 32,
    borderColor: "#1e293b",
    borderWidth: 1,
    gap: 16,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  modalCopy: {
    color: "#94a3b8",
    fontSize: 17,
    lineHeight: 25,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
  },
  sectionHeader: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  sizeBtn: {
    minWidth: 110,
  },
  trackBtn: {
    minWidth: 150,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginTop: 16,
    minWidth: 100,
  },
});
