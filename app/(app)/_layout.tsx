import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="player" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
