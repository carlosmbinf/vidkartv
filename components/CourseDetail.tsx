import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SuscripcionesCursoCollection } from "./collections";
import { TVFocusButton } from "./TVFocusButton";
import { Meteor } from "../services/meteor/client";
import { useCurrentSession } from "../services/meteor/session";
import type { Course, CourseLesson } from "../types/course";

const PRINCIPAL_USERNAMES = ["carlosmbinf"];
const callMethod = (name: string, ...args: unknown[]) =>
  new Promise<any>((resolve, reject) => {
    Meteor.call(name, ...args, (error: any, result: any) => (error ? reject(error) : resolve(result)));
  });

const getId = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const isActive = (subscription: any) => subscription?.estado === "ACTIVA" && (!subscription.fechaFin || new Date(subscription.fechaFin) > new Date());

export default function CourseDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = getId(id) || "";
  const { user, userId, userReady } = useCurrentSession();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [lessons, setLessons] = React.useState<CourseLesson[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [working, setWorking] = React.useState(false);
  const [accessCheck, setAccessCheck] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState("");

  const { subscription, subscriptionReady } = Meteor.useTracker(() => {
    if (!courseId || !userId) return { subscription: null, subscriptionReady: false };
    const handle = Meteor.subscribe("cursos.suscripciones.propias");
    return {
      subscription: SuscripcionesCursoCollection.findOne({ cursoId: courseId, userId }),
      subscriptionReady: handle.ready(),
    };
  }, [courseId, userId]);

  const loadCourse = React.useCallback(async () => {
    if (!courseId || !userId) return;
    setLoading(true);
    setError("");
    try {
      const result = await callMethod("cursos.detalle.obtener", courseId);
      setCourse(result?.course || null);
      setLessons(Array.isArray(result?.lessons) ? result.lessons : []);
    } catch (nextError: any) {
      setError(nextError?.reason || nextError?.message || "No se pudo cargar el curso.");
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  React.useEffect(() => { loadCourse(); }, [loadCourse]);

  const administrativeAccess = PRINCIPAL_USERNAMES.includes(String(user?.username || "").toLowerCase());
  const ownerAccess = Boolean(course?.profesorId && course.profesorId === userId);
  const activeSubscription = isActive(subscription);
  const directAccess = administrativeAccess || ownerAccess || activeSubscription;
  const hasAccess = directAccess || accessCheck === true;

  React.useEffect(() => {
    let mounted = true;
    if (!courseId || !userReady || !user || directAccess) {
      setAccessCheck(directAccess ? true : null);
      return () => { mounted = false; };
    }
    setAccessCheck(null);
    callMethod("cursos.puedeAcceder", courseId)
      .then((result) => { if (mounted) setAccessCheck(Boolean(result?.access)); })
      .catch(() => { if (mounted) setAccessCheck(false); });
    return () => { mounted = false; };
  }, [courseId, directAccess, user, userReady]);

  const subscribe = async () => {
    if (!courseId || working) return;
    setWorking(true);
    try {
      await callMethod("cursos.agregarAlCarrito", courseId);
      Alert.alert("Curso añadido", "La suscripción mensual quedó añadida al carrito.", [{ text: "Continuar" }]);
    } catch (nextError: any) {
      Alert.alert("No se pudo continuar", nextError?.reason || nextError?.message || "Inténtalo nuevamente.");
    } finally {
      setWorking(false);
    }
  };

  if (!userReady || loading || !subscriptionReady) {
    return <View style={styles.state}><ActivityIndicator color="#2dd4bf" size="large" /><Text style={styles.stateText}>Cargando curso…</Text></View>;
  }
  if (!user) {
    router.replace("/(auth)/login");
    return <View style={styles.state} />;
  }
  if (!course) {
    return <View style={styles.state}><Text style={styles.errorTitle}>{error || "Curso no encontrado"}</Text><TVFocusButton label="Volver" hasTVPreferredFocus onPress={() => router.back()} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={styles.brand}>VIDKAR</Text><Text style={styles.kicker}>ACADEMIA TV</Text></View>
        <TVFocusButton label="Volver a cursos" variant="outline" hasTVPreferredFocus onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {course.portadaUrl ? <Image source={{ uri: course.portadaUrl }} resizeMode="cover" style={styles.cover} /> : <LinearGradient colors={["#0f766e", "#164e63", "#172554"]} style={StyleSheet.absoluteFillObject} />}
          <LinearGradient colors={["rgba(2,8,13,0.08)", "rgba(2,8,13,0.9)"]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}><Text style={styles.badge}>CURSO</Text><Text style={styles.meta}>{course.categoria || "Academia"}</Text><Text style={styles.meta}>{course.nivel || "Todos los niveles"}</Text></View>
            <Text style={styles.title}>{course.titulo}</Text>
            <Text style={styles.professor}>{course.profesorNombre || "Profesor VIDKAR"}</Text>
          </View>
        </View>
        <Text style={styles.description}>{course.descripcion || "Aprende con clases guiadas y contenido práctico."}</Text>
        {!hasAccess ? (
          <View style={styles.subscriptionPanel}>
            <View style={styles.subscriptionCopy}><Text style={styles.panelTitle}>Suscripción mensual</Text><Text style={styles.panelText}>Accede a todas las lecciones de este curso.</Text><Text style={styles.price}>{Number(course.precioMensual || 0).toFixed(2)} {course.moneda || "CUP"} <Text style={styles.pricePeriod}>por mes</Text></Text></View>
            <TVFocusButton label={working ? "Añadiendo…" : "Añadir al carrito"} variant="primary" disabled={working || accessCheck === null} onPress={subscribe} />
          </View>
        ) : <View style={styles.accessPanel}><Text style={styles.accessTitle}>✓ Acceso disponible</Text><Text style={styles.accessText}>{activeSubscription ? `Vigente hasta ${new Date(subscription?.fechaFin).toLocaleDateString("es-ES")}` : "Puedes empezar tus lecciones."}</Text></View>}
        <View style={styles.lessonHeader}><Text style={styles.sectionTitle}>Programa del curso</Text><Text style={styles.lessonCount}>{lessons.length} clases</Text></View>
        <View style={styles.lessonList}>
          {lessons.map((lesson, index) => {
            const playable = hasAccess && lesson?.publicado !== false && lesson?.video?.estado !== "ERROR";
            return <View key={lesson._id} style={styles.lessonRow}>
              <View style={styles.lessonNumber}><Text style={styles.lessonNumberText}>{String(lesson.orden || index + 1).padStart(2, "0")}</Text></View>
              <View style={styles.lessonCopy}><Text numberOfLines={2} style={styles.lessonTitle}>{lesson.titulo || `Lección ${index + 1}`}</Text><Text numberOfLines={2} style={styles.lessonDescription}>{lesson.descripcion || "Clase en video"}</Text></View>
              <TVFocusButton label={playable ? "▶ Ver" : "🔒 Bloqueada"} variant={playable ? "primary" : "secondary"} disabled={!playable} onPress={() => router.push({ pathname: "/(app)/course-player" as any, params: { lessonId: lesson._id, courseId, title: lesson.titulo || "Lección" } })} />
            </View>;
          })}
          {!lessons.length ? <Text style={styles.empty}>Aún no hay lecciones publicadas.</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#070f1c", flex: 1 },
  header: { alignItems: "center", backgroundColor: "rgba(7,15,28,0.98)", borderBottomColor: "#20314b", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 48, paddingVertical: 16 },
  brand: { color: "#ffffff", fontSize: 20, fontWeight: "900", letterSpacing: 4 },
  kicker: { color: "#5eead4", fontSize: 10, fontWeight: "900", letterSpacing: 2, marginTop: 2 },
  content: { paddingBottom: 60, paddingHorizontal: 48, paddingTop: 28 },
  hero: { aspectRatio: 2.7, borderRadius: 22, overflow: "hidden", position: "relative" },
  cover: { height: "100%", width: "100%" },
  heroContent: { bottom: 0, gap: 8, left: 0, padding: 28, position: "absolute", right: 0 },
  badgeRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  badge: { backgroundColor: "#0f766e", borderRadius: 7, color: "#ccfbf1", fontSize: 10, fontWeight: "900", paddingHorizontal: 9, paddingVertical: 5 },
  meta: { color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  title: { color: "#ffffff", fontSize: 34, fontWeight: "900" },
  professor: { color: "#99f6e4", fontSize: 15, fontWeight: "800" },
  description: { color: "#cbd5e1", fontSize: 17, lineHeight: 25, marginTop: 22, maxWidth: 900 },
  subscriptionPanel: { alignItems: "center", backgroundColor: "#13283a", borderColor: "rgba(94,234,212,0.28)", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 18, justifyContent: "space-between", marginTop: 22, padding: 20 },
  subscriptionCopy: { flex: 1, gap: 5 },
  panelTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "900" },
  panelText: { color: "#a8bbca", fontSize: 14 },
  price: { color: "#5eead4", fontSize: 24, fontWeight: "900", marginTop: 4 },
  pricePeriod: { color: "#94a3b8", fontSize: 12, fontWeight: "700" },
  accessPanel: { backgroundColor: "rgba(20,83,45,0.34)", borderColor: "rgba(74,222,128,0.3)", borderRadius: 18, borderWidth: 1, marginTop: 22, padding: 18 },
  accessTitle: { color: "#bbf7d0", fontSize: 18, fontWeight: "900" },
  accessText: { color: "#d1fae5", fontSize: 14, marginTop: 4 },
  lessonHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 30 },
  sectionTitle: { color: "#f8fafc", fontSize: 23, fontWeight: "900" },
  lessonCount: { color: "#5eead4", fontSize: 13, fontWeight: "900" },
  lessonList: { backgroundColor: "#0f1b2b", borderColor: "rgba(148,163,184,0.18)", borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  lessonRow: { alignItems: "center", borderBottomColor: "rgba(148,163,184,0.13)", borderBottomWidth: 1, flexDirection: "row", gap: 14, minHeight: 90, padding: 16 },
  lessonNumber: { alignItems: "center", backgroundColor: "rgba(45,212,191,0.12)", borderRadius: 10, height: 42, justifyContent: "center", width: 42 },
  lessonNumberText: { color: "#5eead4", fontSize: 14, fontWeight: "900" },
  lessonCopy: { flex: 1, gap: 4 },
  lessonTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "900" },
  lessonDescription: { color: "#94a3b8", fontSize: 13, lineHeight: 18 },
  empty: { color: "#94a3b8", padding: 28, textAlign: "center" },
  state: { alignItems: "center", backgroundColor: "#070f1c", flex: 1, gap: 14, justifyContent: "center" },
  stateText: { color: "#94a3b8", fontSize: 17 },
  errorTitle: { color: "#fecaca", fontSize: 18, fontWeight: "800", marginBottom: 18 },
});
