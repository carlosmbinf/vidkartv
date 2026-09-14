import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useCurrentSession } from "../../services/meteor/session";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { userId, userReady } = useCurrentSession();

  React.useEffect(() => {
    if (!userReady) return;
    if (!userId) router.replace("/(auth)/login");
    if (!userId) router.replace("/(auth)/login");
    else router.replace("/(app)/home");
  }, [router, userId, userReady]);

  return <View style={styles.center} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#080b12" },
});