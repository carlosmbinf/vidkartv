import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Meteor, ensureMeteorConnection } from "../services/meteor/client";
import { destinationForUser, useCurrentSession } from "../services/meteor/session";
import { registerPushTokenForActiveSession, setupPushListeners } from "../services/notifications/push";

export default function EntryScreen() {
  const router = useRouter();
  const [connectionError, setConnectionError] = React.useState<string | null>(null);
  const registeredPushUserRef = React.useRef<string | null>(null);
  const { connected } = Meteor.useTracker(() => ({
    connected: Boolean(Meteor.status?.()?.connected),
  }));
  const { userId, user, userReady } = useCurrentSession();

  React.useEffect(() => {
    let cancelled = false;
    ensureMeteorConnection().catch((error: any) => {
      if (!cancelled) setConnectionError(error?.message || "No se pudo conectar con VIDKAR.");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!connected || (userId && !userReady)) return;
    router.replace(userId ? destinationForUser(user) : "/(auth)/login");
  }, [connected, router, user, userId, userReady]);

  React.useEffect(() => setupPushListeners(), []);

  React.useEffect(() => {
    const userId = user?._id || user?.id || null;
    if (!connected || !userId || registeredPushUserRef.current === userId) return;
    registeredPushUserRef.current = userId;
    registerPushTokenForActiveSession().catch(() => null);
  }, [connected, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VIDKAR</Text>
      <Text style={styles.subtitle}>EXPERIENCIA TV</Text>
      {connectionError ? <Text style={styles.error}>{connectionError}</Text> : <ActivityIndicator color="#e50914" size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#080b12", gap: 14 },
  logo: { color: "#ffffff", fontSize: 48, fontWeight: "900", letterSpacing: 8 },
  subtitle: { color: "#e50914", fontSize: 17, fontWeight: "800", letterSpacing: 5 },
  error: { maxWidth: 640, color: "#ffb4ab", fontSize: 18, textAlign: "center", paddingHorizontal: 24 },
});
