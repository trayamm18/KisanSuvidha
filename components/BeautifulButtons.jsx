import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Beautiful Button Component with Animations
 * Professional, consistent button used throughout app
 */

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon = null,
  size = "medium",
  fullWidth = true,
  style = {},
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 12 },
    medium: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 14 },
    large: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 },
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        style={[
          styles.button,
          sizeStyles[size],
          fullWidth && { width: "100%" },
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <Animated.View style={[styles.loadingContainer]}>
            <AnimatedSpinner />
            <Text style={styles.buttonText}>Loading...</Text>
          </Animated.View>
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.buttonText}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function SecondaryButton({ title, onPress, icon = null, style = {} }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.secondaryButton, style]}
      >
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color="#2E7D32"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.secondaryButtonText}>{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AnimatedSpinner() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Ionicons name="ellipse" size={14} color="#fff" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default { PrimaryButton, SecondaryButton };
