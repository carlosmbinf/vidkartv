import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { TVFocusButton } from "./TVFocusButton";
import { tvTokens } from "../theme";

export type TVCatalogTab = "movies" | "series" | "courses";

export interface TVNavHeaderProps {
  activeTab: TVCatalogTab;
  onSelectTab: (tab: TVCatalogTab) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onLogout: () => void;
  hasMovieSubscription?: boolean;
  username?: string;
}

export function TVNavHeader({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onLogout,
  hasMovieSubscription = true,
  username,
}: TVNavHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Marca e identidad */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandLogo}>VIDKAR</Text>
        <Text style={styles.brandKicker}>{hasMovieSubscription ? "CINEMA TV" : "ACADEMIA TV"}</Text>
      </View>

      {/* Selector de pestañas: Películas / Series */}
      <View style={styles.tabsContainer}>
        {hasMovieSubscription ? (
          <>
            <TVFocusButton
              label="Películas"
              icon="🎬"
              active={activeTab === "movies"}
              onPress={() => onSelectTab("movies")}
              style={[styles.tabButton, activeTab === "movies" && styles.tabButtonActive]}
              hasTVPreferredFocus={false}
            />
            <TVFocusButton
              label="Series"
              icon="📺"
              active={activeTab === "series"}
              onPress={() => onSelectTab("series")}
              style={[styles.tabButton, activeTab === "series" && styles.tabButtonActive]}
              hasTVPreferredFocus={false}
            />
          </>
        ) : null}
        <TVFocusButton
          label="Cursos"
          icon="🎓"
          active={activeTab === "courses"}
          onPress={() => onSelectTab("courses")}
          style={[styles.tabButton, styles.courseTabButton, activeTab === "courses" && styles.courseTabButtonActive]}
          hasTVPreferredFocus={!hasMovieSubscription}
        />
      </View>

      {/* Buscador y opciones de usuario */}
      <View style={styles.actionsContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={hasMovieSubscription ? "Buscar título, actor o género…" : "Buscar curso o profesor…"}
          placeholderTextColor="#64748b"
          style={styles.searchInput}
        />
        {username ? (
          <View style={styles.userBadge}>
            <Text style={styles.userText}>{username}</Text>
          </View>
        ) : null}
        <TVFocusButton
          label="Salir"
          variant="outline"
          onPress={onLogout}
          style={styles.logoutBtn}
          accessibilityLabel="Cerrar sesión"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 76,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(7,10,17,0.97)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30,41,59,0.5)",
  },
  brandContainer: {
    flexDirection: "column",
  },
  brandLogo: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 4,
  },
  brandKicker: {
    color: "#e50914",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: -2,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15,23,42,0.72)",
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tabButton: {
    minHeight: 38,
    minWidth: 114,
    backgroundColor: "transparent",
    borderRadius: 999,
    borderWidth: 0,
  },
  tabButtonActive: {
    backgroundColor: "#e50914",
  },
  courseTabButton: {
    borderColor: "rgba(45, 212, 191, 0.28)",
  },
  courseTabButtonActive: {
    backgroundColor: "#0f766e",
    borderColor: "#2dd4bf",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  searchInput: {
    width: 254,
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 15,
    color: "#ffffff",
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  userBadge: {
    backgroundColor: tvTokens.colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderColor: tvTokens.colors.border,
    borderWidth: 1,
  },
  userText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  logoutBtn: {
    minHeight: 40,
    minWidth: 74,
  },
});
