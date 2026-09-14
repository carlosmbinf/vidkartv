import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import { TVFocusButton } from "../../components/TVFocusButton";
import { Meteor } from "../../services/meteor/client";
import { destinationForUser, useCurrentSession } from "../../services/meteor/session";
import { registerPushTokenForActiveSession } from "../../services/notifications/push";

export default function LoginScreen() {
  const router = useRouter();
  const { userId, user, userReady } = useCurrentSession();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (userId && userReady && !submitting) {
      router.replace(destinationForUser(user));
    }
  }, [router, submitting, user, userId, userReady]);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Datos incompletos", "Escribe tu usuario y contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        Meteor.loginWithPassword(username.trim(), password, (error: any) => (error ? reject(error) : resolve()));
      });
      registerPushTokenForActiveSession().catch(() => null);
    } catch (error: any) {
      Alert.alert("No se pudo iniciar sesión", error?.reason || "Credenciales incorrectas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.brand}>
        <Text style={styles.logo}>VIDKAR</Text>
        <Text style={styles.kicker}>VIDKAR EN PANTALLA GRANDE</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.copy}>Usa la misma cuenta que en Android y iOS.</Text>
        <TextInput
          autoFocus
          mode="outlined"
          label="Usuario o correo"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          textColor="#ffffff"
          outlineColor="#334155"
          activeOutlineColor="#e50914"
          theme={{ colors: { onSurfaceVariant: "#a9b4c7" } }}
          returnKeyType="next"
        />
        <TextInput
          mode="outlined"
          label="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          style={styles.input}
          textColor="#ffffff"
          outlineColor="#334155"
          activeOutlineColor="#e50914"
          theme={{ colors: { onSurfaceVariant: "#a9b4c7" } }}
        />
        <TVFocusButton label={submitting ? "Conectando…" : "Entrar"} disabled={submitting} onPress={handleLogin} hasTVPreferredFocus={false} style={styles.button} />
        <Text style={styles.hint}>Selecciona los campos con el control remoto y pulsa OK.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#080b12", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 80, padding: 48 },
  brand: { width: 320 },
  logo: { color: "#ffffff", fontSize: 46, fontWeight: "900", letterSpacing: 7 },
  kicker: { color: "#e50914", fontSize: 12, fontWeight: "800", letterSpacing: 2.5, marginTop: 9 },
  card: { width: 410, padding: 28, borderRadius: 18, backgroundColor: "#111827", borderColor: "rgba(148,163,184,0.16)", borderWidth: 1, boxShadow: "0px 8px 18px rgba(0,0,0,0.32)" },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "800" },
  copy: { color: "#a9b4c7", fontSize: 15, marginTop: 6, marginBottom: 20 },
  input: { marginBottom: 12, backgroundColor: "#172033" },
  button: { alignSelf: "flex-start", marginTop: 4, minHeight: 44 },
  hint: { color: "#71809a", fontSize: 12, marginTop: 16 },
});
