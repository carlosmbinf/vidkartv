import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TVFocusButton } from "../../components/TVFocusButton";
import { Meteor } from "../../services/meteor/client";
import { destinationForUser, hasMovieSubscription, useCurrentSession } from "../../services/meteor/session";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, userId, userReady } = useCurrentSession();

  React.useEffect(() => {
    if (!userReady) return;
    if (!userId) router.replace("/(auth)/login");
    else if (hasMovieSubscription(user)) router.replace(destinationForUser(user));
  }, [router, user, userId, userReady]);

  const logout = () => {
    Meteor.logout(() => router.replace("/(auth)/login"));
  };

  if (!userReady || !userId || hasMovieSubscription(user)) {
    return <View style={styles.center} />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.logo}>VIDKAR</Text>
      <Text style={styles.title}>Suscripción necesaria</Text>
      <Text style={styles.copy}>
        Esta cuenta inició sesión correctamente, pero todavía no tiene activa la suscripción de películas.
      </Text>
      <Text style={styles.help}>Activa la suscripción desde los canales habituales de VIDKAR y vuelve a intentarlo.</Text>
      <View style={styles.actions}>
        <TVFocusButton label="Reintentar" onPress={() => router.replace("/")} hasTVPreferredFocus />
        <TVFocusButton label="Cerrar sesión" onPress={logout} style={styles.secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 48, backgroundColor: "#080b12" },
  center: { flex: 1, backgroundColor: "#080b12" },
  logo: { color: "#e50914", fontSize: 20, fontWeight: "900", letterSpacing: 5 },
  title: { color: "#ffffff", fontSize: 32, fontWeight: "900", marginTop: 18, textAlign: "center" },
  copy: { maxWidth: 660, color: "#d4dbea", fontSize: 17, lineHeight: 25, marginTop: 14, textAlign: "center" },
  help: { maxWidth: 620, color: "#96a4ba", fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  secondary: { backgroundColor: "#26344e" },
});