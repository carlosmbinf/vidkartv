import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { tvTokens } from "../theme";

export type TVButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type TVButtonSize = "chip" | "regular" | "large";

export type TVFocusButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  icon?: string;
  variant?: TVButtonVariant;
  size?: TVButtonSize;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function TVFocusButton({
  label,
  icon,
  variant = "secondary",
  size = "chip",
  active = false,
  style,
  labelStyle,
  ...props
}: TVFocusButtonProps) {
  const [focused, setFocused] = React.useState(false);
  const { onFocus, onBlur, disabled } = props;

  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "danger":
        return styles.danger;
      case "outline":
        return styles.outline;
      case "ghost":
        return styles.ghost;
      case "secondary":
      default:
        return styles.secondary;
    }
  };

  return (
    <Pressable
      {...props}
      focusable={!disabled}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => [
        styles.base,
        getVariantStyle(),
        styles[size],
        active && styles.active,
        style,
        focused && styles.focused,
        focused && variant === "primary" && styles.primaryFocused,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.label,
          variant === "primary" && styles.primaryLabel,
          active && styles.activeLabel,
          labelStyle,
          focused && styles.focusedLabel,
        ]}
      >
        {icon ? `${icon}  ` : ""}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    minWidth: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: tvTokens.radius.chip,
    borderWidth: 2,
    borderColor: "transparent",
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  regular: {
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  large: {
    minHeight: 50,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  primary: {
    backgroundColor: tvTokens.colors.accent,
    borderColor: "rgba(255,255,255,0.12)",
    boxShadow: tvTokens.shadow.raised,
  },
  secondary: {
    backgroundColor: tvTokens.colors.surfaceRaised,
    borderColor: tvTokens.colors.border,
    boxShadow: tvTokens.shadow.card,
  },
  outline: {
    backgroundColor: "rgba(15,23,42,0.58)",
    borderColor: "rgba(148,163,184,0.32)",
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: "#7f1d1d",
    borderColor: "rgba(254,202,202,0.25)",
  },
  active: {
    backgroundColor: "rgba(229,9,20,0.18)",
    borderColor: "rgba(255,52,64,0.7)",
    boxShadow: "0px 3px 10px rgba(229,9,20,0.18)",
  },
  focused: {
    borderColor: "#ffffff",
    transform: [{ scale: 1.025 }, { translateY: -1 }],
    boxShadow: tvTokens.shadow.focus,
    zIndex: 10,
  },
  primaryFocused: {
    backgroundColor: tvTokens.colors.accentBright,
    borderColor: "#ffffff",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.25,
  },
  primaryLabel: {
    color: "#ffffff",
  },
  activeLabel: {
    color: "#ffffff",
    fontWeight: "800",
  },
  focusedLabel: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
