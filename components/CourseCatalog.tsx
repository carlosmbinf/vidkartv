import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SuscripcionesCursoCollection } from "./collections";
import { TVFocusButton } from "./TVFocusButton";
import { Meteor } from "../services/meteor/client";
import { useCurrentSession } from "../services/meteor/session";
import type { Course } from "../types/course";

const callMethod = (name: string, ...args: unknown[]) =>
  new Promise<any>((resolve, reject) => {
    Meteor.call(name, ...args, (error: any, result: any) => (error ? reject(error) : resolve(result)));
  });

const isActiveSubscription = (subscription: any) =>
  subscription?.estado === "ACTIVA" && (!subscription.fechaFin || new Date(subscription.fechaFin) > new Date());

const visible = (course: Course) => course?._id && course.titulo;

function CourseCard({ course, active, preferred, onPress }: { course: Course; active: boolean; preferred?: boolean; onPress: () => void }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <Pressable
      accessibilityLabel={`Abrir curso ${course.titulo}`}
      accessibilityRole="button"
      focusable
      hasTVPreferredFocus={preferred}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={[styles.card, focused && styles.cardFocused]}
    >
      <View style={styles.coverFrame}>
        {course.portadaUrl ? <Image source={{ uri: course.portadaUrl }} resizeMode="cover" style={styles.coverImage} /> : <LinearGradient colors={["#123b4a", "#172554", "#3b2a0d"]} style={StyleSheet.absoluteFillObject} />}
        <LinearGradient colors={["transparent", "rgba(2,8,13,0.92)"]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.coverTopRow}>
          <Text style={styles.categoryBadge}>🎓 {course.categoria || "Curso"}</Text>
          <Text style={[styles.accessBadge, active ? styles.accessActive : styles.accessLocked]}>{active ? "ACTIVO" : "VER CURSO"}</Text>
        </View>
        <View style={styles.coverBottom}>
          <Text numberOfLines={2} style={styles.coverTitle}>{course.titulo}</Text>
          <Text numberOfLines={1} style={styles.coverMeta}>{course.profesorNombre || "Profesor VIDKAR"} · {course.nivel || "Todos los niveles"}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.cardTitle}>{course.titulo}</Text>
        <Text numberOfLines={2} style={styles.cardDescription}>{course.descripcion || "Aprende a tu ritmo con clases guiadas."}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.coursePrice}>{Number(course.precioMensual || 0).toFixed(2)} {course.moneda || "CUP"}</Text>
          <Text style={styles.coursePeriod}>mensual</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function CourseCatalog({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  const router = useRouter();
  const { userId, userReady } = useCurrentSession();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const { subscriptions, subscriptionsReady } = Meteor.useTracker(() => {
    if (!userId) return { subscriptions: [], subscriptionsReady: false };
    const handle = Meteor.subscribe("cursos.suscripciones.propias");
    return {
      subscriptions: SuscripcionesCursoCollection.find({ userId }).fetch(),
      subscriptionsReady: handle.ready(),
    };
  }, [userId]);

  const loadCourses = React.useCallback(async (refresh = false) => {
    if (!userReady || !userId) return;
    if (refresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const result = await callMethod("cursos.catalogo.obtener");
      setCourses(Array.isArray(result?.courses) ? result.courses : []);
    } catch (nextError: any) {
      setError(nextError?.reason || nextError?.message || "No se pudo cargar el catálogo de cursos.");
    } finally {
      if (refresh) setRefreshing(false); else setLoading(false);
    }
  }, [userId, userReady]);

  React.useEffect(() => { loadCourses(); }, [loadCourses]);

  const activeByCourse = React.useMemo(() => new Set(
    subscriptions.filter(isActiveSubscription).map((subscription: any) => String(subscription.cursoId)),
  ), [subscriptions]);
  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return courses.filter((course) => visible(course) && (!normalized || [course.titulo, course.descripcion, course.categoria, course.nivel, course.profesorNombre, course.profesorUsername].filter(Boolean).some((value) => String(value).toLocaleLowerCase("es").includes(normalized))));
  }, [courses, query]);
  const grouped = React.useMemo(() => {
    const groups = new Map<string, Course[]>();
    filtered.forEach((course) => {
      const key = course.categoria || "General";
      groups.set(key, [...(groups.get(key) || []), course]);
    });
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [filtered]);
  const featured = filtered[0];

  if (!userReady || loading || !subscriptionsReady) {
    return <View style={styles.state}><ActivityIndicator color="#2dd4bf" size="large" /><Text style={styles.stateText}>Preparando VIDKAR Academy…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <LinearGradient colors={["#0f766e", "#164e63", "#0b1220"]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>VIDKAR ACADEMY</Text>
          <Text style={styles.heroTitle}>Aprende en pantalla grande</Text>
          <Text style={styles.heroSubtitle}>Clases guiadas, profesores especialistas y progreso a tu ritmo.</Text>
          <View style={styles.heroActions}>
            <TVFocusButton label="Explorar cursos" variant="primary" hasTVPreferredFocus={Boolean(featured)} onPress={() => featured && router.push({ pathname: "/(app)/course" as any, params: { id: featured._id } })} />
            <Text style={styles.courseCount}>{filtered.length} {filtered.length === 1 ? "curso disponible" : "cursos disponibles"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput accessibilityLabel="Buscar cursos" onChangeText={onQueryChange} placeholder="Buscar por tema, nivel o profesor" placeholderTextColor="#7890a6" style={styles.searchInput} value={query} />
        {query ? <TVFocusButton label="Limpiar" size="chip" onPress={() => onQueryChange("")} /> : null}
      </View>

      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><TVFocusButton label="Reintentar" onPress={() => loadCourses(true)} /></View> : null}
      {refreshing ? <ActivityIndicator color="#2dd4bf" style={styles.refreshIndicator} /> : null}
      {!filtered.length && !error ? <View style={styles.empty}><Text style={styles.emptyTitle}>No encontramos cursos</Text><Text style={styles.emptyText}>Prueba con otro tema, nivel o profesor.</Text></View> : null}
      {grouped.map((group, groupIndex) => (
        <View key={group.title} style={styles.rowSection}>
          <View style={styles.rowHeader}><Text style={styles.rowTitle}>{group.title}</Text><Text style={styles.rowCount}>{group.data.length}</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
            {group.data.map((course, index) => (
              <CourseCard key={course._id} active={activeByCourse.has(String(course._id))} course={course} onPress={() => router.push({ pathname: "/(app)/course" as any, params: { id: course._id } })} preferred={groupIndex === 0 && index === 0 && !featured} />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 56, paddingHorizontal: 48, paddingTop: 24 },
  hero: { borderColor: "rgba(45,212,191,0.3)", borderRadius: 24, borderWidth: 1, height: 230, overflow: "hidden", position: "relative" },
  heroCopy: { justifyContent: "center", flex: 1, maxWidth: 640, paddingHorizontal: 34 },
  eyebrow: { color: "#5eead4", fontSize: 12, fontWeight: "900", letterSpacing: 2.4 },
  heroTitle: { color: "#f8fafc", fontSize: 34, fontWeight: "900", marginTop: 8 },
  heroSubtitle: { color: "#cbd5e1", fontSize: 17, lineHeight: 24, marginTop: 8 },
  heroActions: { alignItems: "center", flexDirection: "row", gap: 18, marginTop: 18 },
  courseCount: { color: "#99f6e4", fontSize: 13, fontWeight: "800" },
  searchRow: { alignItems: "center", backgroundColor: "#0f172a", borderColor: "#26364e", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, minHeight: 48, paddingHorizontal: 16 },
  searchIcon: { color: "#94a3b8", fontSize: 24 },
  searchInput: { color: "#f8fafc", flex: 1, fontSize: 15, minHeight: 44 },
  refreshIndicator: { marginTop: 18 },
  rowSection: { marginTop: 28 },
  rowHeader: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 10 },
  rowTitle: { color: "#f8fafc", fontSize: 21, fontWeight: "900" },
  rowCount: { color: "#5eead4", fontSize: 12, fontWeight: "800" },
  rowContent: { gap: 14, paddingBottom: 12, paddingRight: 22 },
  card: { backgroundColor: "#0f1b2b", borderColor: "rgba(148,163,184,0.17)", borderRadius: 18, borderWidth: 1, overflow: "hidden", width: 286 },
  cardFocused: { borderColor: "#5eead4", borderWidth: 3 },
  coverFrame: { aspectRatio: 16 / 8.5, overflow: "hidden", position: "relative" },
  coverImage: { height: "100%", position: "absolute", width: "100%" },
  coverTopRow: { flexDirection: "row", justifyContent: "space-between", left: 12, position: "absolute", right: 12, top: 12 },
  categoryBadge: { backgroundColor: "rgba(2,8,13,0.68)", borderRadius: 8, color: "#ccfbf1", fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5 },
  accessBadge: { borderRadius: 8, fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5 },
  accessActive: { backgroundColor: "rgba(20,83,45,0.84)", color: "#bbf7d0" },
  accessLocked: { backgroundColor: "rgba(15,23,42,0.78)", color: "#cbd5e1" },
  coverBottom: { bottom: 12, left: 12, position: "absolute", right: 12 },
  coverTitle: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  coverMeta: { color: "#cbd5e1", fontSize: 11, fontWeight: "700", marginTop: 4 },
  cardBody: { gap: 7, padding: 14 },
  cardTitle: { color: "#f8fafc", fontSize: 17, fontWeight: "900" },
  cardDescription: { color: "#94a3b8", fontSize: 12, lineHeight: 17, minHeight: 34 },
  cardFooter: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  coursePrice: { color: "#5eead4", fontSize: 16, fontWeight: "900" },
  coursePeriod: { color: "#64748b", fontSize: 10, fontWeight: "800" },
  state: { alignItems: "center", flex: 1, gap: 14, justifyContent: "center" },
  stateText: { color: "#94a3b8", fontSize: 17, fontWeight: "700" },
  errorBox: { alignItems: "center", backgroundColor: "rgba(127,29,29,0.28)", borderColor: "rgba(248,113,113,0.28)", borderRadius: 16, borderWidth: 1, gap: 12, marginTop: 20, padding: 20 },
  errorText: { color: "#fecaca", fontSize: 15, textAlign: "center" },
  empty: { alignItems: "center", gap: 8, padding: 70 },
  emptyTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  emptyText: { color: "#94a3b8", fontSize: 15 },
});
