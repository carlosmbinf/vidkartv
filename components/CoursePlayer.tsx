import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { TVFocusButton } from "./TVFocusButton";
import { VLCPlayer } from "./VLCPlayer";
import { Meteor } from "../services/meteor/client";
import { useCurrentSession } from "../services/meteor/session";
import type { CourseLesson } from "../types/course";

const CACHE_KEY = "vidkar.coursePlaybackCache.v1";
const RESUME_MIN_SECONDS = 15;
const SAVE_INTERVAL_SECONDS = 5;
const BUFFER_OPTIONS = ["--network-caching=1500", "--live-caching=1500", "--file-caching=1200", "--disc-caching=1200", "--http-reconnect", "--avcodec-fast"];

const getId = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const callMethod = (name: string, ...args: unknown[]) => new Promise<any>((resolve, reject) => Meteor.call(name, ...args, (error: any, result: any) => (error ? reject(error) : resolve(result))));
const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
};

async function readPlayback(lessonId: string) {
  try {
    const raw = await SecureStore.getItemAsync(CACHE_KEY);
    return JSON.parse(raw || "{}")?.[lessonId]?.playback || { currentTime: 0, duration: 0, completed: false };
  } catch {
    return { currentTime: 0, duration: 0, completed: false };
  }
}

async function savePlayback(lessonId: string, playback: { currentTime: number; duration: number; completed: boolean }) {
  try {
    const raw = await SecureStore.getItemAsync(CACHE_KEY);
    const cache = JSON.parse(raw || "{}");
    cache[lessonId] = { playback: { ...playback, updatedAt: new Date().toISOString() } };
    await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // El progreso local no debe interrumpir la clase.
  }
}

export default function CoursePlayer() {
  const router = useRouter();
  const { lessonId, courseId, title: routeTitle } = useLocalSearchParams<{ lessonId?: string | string[]; courseId?: string | string[]; title?: string | string[] }>();
  const normalizedLessonId = getId(lessonId) || "";
  const normalizedCourseId = getId(courseId) || "";
  const { user, userReady } = useCurrentSession();
  const [lesson, setLesson] = React.useState<CourseLesson | null>(null);
  const [sourceUrl, setSourceUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [paused, setPaused] = React.useState(false);
  const [buffering, setBuffering] = React.useState(true);
  const [hasFrame, setHasFrame] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [startAt, setStartAt] = React.useState(0);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const playerRef = React.useRef<any>(null);
  const persistedRef = React.useRef(0);

  const load = React.useCallback(async () => {
    if (!normalizedLessonId || !normalizedCourseId || !userReady || !user) return;
    setLoading(true);
    setError("");
    setSourceUrl(null);
    try {
      const result = await callMethod("cursos.detalle.obtener", normalizedCourseId);
      const nextLesson = (Array.isArray(result?.lessons) ? result.lessons : []).find((item: CourseLesson) => String(item._id) === String(normalizedLessonId));
      if (!nextLesson) throw new Error("No se encontró la lección.");
      const playback = await readPlayback(normalizedLessonId);
      let resumeAt = 0;
      const savedTime = Number(playback.currentTime || 0);
      const savedDuration = Number(playback.duration || 0);
      if (!playback.completed && savedTime > RESUME_MIN_SECONDS && (!savedDuration || savedTime < savedDuration - RESUME_MIN_SECONDS)) {
        resumeAt = await new Promise<number>((resolve) => {
          Alert.alert("Continuar clase", `Hay un punto guardado en ${formatTime(savedTime * 1000)}.`, [
            { text: "Empezar de nuevo", onPress: () => resolve(0) },
            { text: "Continuar", onPress: () => resolve(Math.floor(savedTime)) },
          ], { cancelable: false });
        });
      }
      const media = await callMethod("cursos.media.solicitarReproduccion", normalizedLessonId);
      if (!media?.url) throw new Error("La lección no tiene video disponible.");
      setLesson(nextLesson);
      setStartAt(resumeAt);
      persistedRef.current = resumeAt;
      setSourceUrl(media.url);
    } catch (nextError: any) {
      setError(nextError?.reason || nextError?.message || "No se pudo iniciar la lección.");
    } finally {
      setLoading(false);
    }
  }, [normalizedCourseId, normalizedLessonId, user, userReady]);

  React.useEffect(() => { load(); }, [load]);

  const saveCurrent = React.useCallback((completed = false) => {
    if (!normalizedLessonId) return;
    savePlayback(normalizedLessonId, {
      completed,
      currentTime: completed ? 0 : Math.floor(currentTime / 1000),
      duration: Math.floor(duration / 1000),
    });
  }, [currentTime, duration, normalizedLessonId]);

  if (!userReady || loading) {
    return <View style={styles.state}><ActivityIndicator color="#2dd4bf" size="large" /><Text style={styles.stateText}>Preparando la lección…</Text></View>;
  }
  if (!user) {
    router.replace("/(auth)/login");
    return <View style={styles.state} />;
  }
  if (error || !sourceUrl || !lesson) {
    return <View style={styles.state}><Text style={styles.errorTitle}>No se pudo abrir la lección</Text><Text style={styles.errorText}>{error || "Video no disponible"}</Text><View style={styles.errorActions}><TVFocusButton label="Reintentar" hasTVPreferredFocus onPress={load} /><TVFocusButton label="Volver al curso" variant="outline" onPress={() => router.back()} /></View></View>;
  }

  const source = { uri: sourceUrl, initType: 2, initOptions: BUFFER_OPTIONS, acceptInvalidCertificates: false };
  const ratio = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const title = lesson.titulo || getId(routeTitle) || "Lección";

  return (
    <View style={styles.playerScreen}>
      <VLCPlayer
        ref={playerRef}
        autoplay
        onBuffering={() => setBuffering(true)}
        onEnd={() => { setPaused(true); setBuffering(false); setHasFrame(true); savePlayback(normalizedLessonId, { completed: true, currentTime: 0, duration: Math.floor(duration / 1000) }); }}
        onError={() => setError("No se pudo reproducir esta lección.")}
        onLoad={(event: any) => { const nextDuration = Number(event?.duration || 0); setDuration(nextDuration); setBuffering(false); if (startAt > 0 && nextDuration > 0) playerRef.current?.seek?.(Math.min(1, startAt * 1000 / nextDuration)); }}
        onPaused={() => { setPaused(true); setBuffering(false); }}
        onPlaying={() => { setPaused(false); setBuffering(false); setHasFrame(true); }}
        onProgress={(event: any) => { const nextTime = Number(event?.currentTime || 0); const nextDuration = Number(event?.duration || duration); setCurrentTime(nextTime); if (nextDuration > 0) setDuration(nextDuration); setHasFrame(true); const seconds = Math.floor(nextTime / 1000); if (Math.abs(seconds - persistedRef.current) >= SAVE_INTERVAL_SECONDS) { persistedRef.current = seconds; savePlayback(normalizedLessonId, { completed: false, currentTime: seconds, duration: Math.floor(nextDuration / 1000) }); } }}
        paused={paused}
        resizeMode="contain"
        source={source}
        style={styles.video}
        videoAspectRatio="16:9"
      />
      {!hasFrame || buffering ? <View pointerEvents="none" style={styles.loadingOverlay}><ActivityIndicator color="#ffffff" size="large" /><Text style={styles.loadingText}>Preparando reproducción</Text></View> : null}
      <TVFocusButton label="‹ Volver" variant="ghost" onPress={() => { saveCurrent(); router.back(); }} style={styles.backButton} />
      {controlsVisible ? <View style={styles.controls}>
        <View style={styles.progressRow}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${ratio * 100}%` }]} /></View><Text style={styles.time}>{formatTime(currentTime)} / {formatTime(duration)}</Text></View>
        <View style={styles.controlRow}><TVFocusButton label={paused ? "▶ Reproducir" : "Ⅱ Pausar"} variant="primary" onPress={() => setPaused((value) => !value)} /><TVFocusButton label="−10 s" onPress={() => playerRef.current?.seek?.(duration > 0 ? Math.max(0, currentTime - 10000) / duration : 0)} /><TVFocusButton label="+10 s" onPress={() => playerRef.current?.seek?.(duration > 0 ? Math.min(duration, currentTime + 10000) / duration : 0)} /><Text numberOfLines={1} style={styles.lessonTitle}>{title}</Text><TVFocusButton label="Ocultar" variant="ghost" onPress={() => setControlsVisible(false)} /></View>
      </View> : <TVFocusButton label="Mostrar controles" variant="ghost" onPress={() => setControlsVisible(true)} style={styles.showControls} />}
    </View>
  );
}

const styles = StyleSheet.create({
  playerScreen: { backgroundColor: "#000", flex: 1 },
  video: { flex: 1, height: "100%", width: "100%" },
  controls: { backgroundColor: "rgba(2,8,13,0.9)", bottom: 0, left: 0, paddingHorizontal: 32, paddingVertical: 16, position: "absolute", right: 0 },
  progressRow: { alignItems: "center", flexDirection: "row", gap: 14 },
  progressTrack: { backgroundColor: "rgba(255,255,255,0.28)", borderRadius: 999, flex: 1, height: 4 },
  progressFill: { backgroundColor: "#2dd4bf", borderRadius: 999, height: 4 },
  time: { color: "#cbd5e1", fontSize: 12, fontWeight: "800", minWidth: 110, textAlign: "right" },
  controlRow: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 12 },
  lessonTitle: { color: "#f8fafc", flex: 1, fontSize: 15, fontWeight: "900", paddingHorizontal: 12, textAlign: "center" },
  backButton: { left: 22, position: "absolute", top: 18 },
  showControls: { bottom: 22, position: "absolute", right: 22 },
  loadingOverlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.24)", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 },
  loadingText: { color: "#ffffff", fontSize: 16, fontWeight: "800", marginTop: 10 },
  state: { alignItems: "center", backgroundColor: "#070f1c", flex: 1, gap: 14, justifyContent: "center", padding: 48 },
  stateText: { color: "#94a3b8", fontSize: 17 },
  errorTitle: { color: "#fecaca", fontSize: 24, fontWeight: "900", textAlign: "center" },
  errorText: { color: "#cbd5e1", fontSize: 16, textAlign: "center" },
  errorActions: { flexDirection: "row", gap: 12, marginTop: 8 },
});
