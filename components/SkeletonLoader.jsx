import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

/**
 * Skeleton Loader Component - Professional Loading State
 * Use this instead of plain spinners for better UX
 */

export function SkeletonLine({ width = "100%", height = 12, style = {} }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonLine,
        {
          width,
          height,
          opacity,
          ...style,
        },
      ]}
    />
  );
}

export function ProductSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonLine width="100%" height={200} style={styles.skeletonImage} />
      <View style={styles.padding}>
        <SkeletonLine width="60%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLine width="100%" height={18} style={{ marginBottom: 12 }} />
        <SkeletonLine width="40%" height={16} />
      </View>
    </View>
  );
}

export function CartItemSkeleton() {
  return (
    <View style={styles.cartItemContainer}>
      <SkeletonLine width={80} height={80} style={styles.skeletonAvatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonLine width="70%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLine width="50%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonLine width="40%" height={16} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <View>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <View key={i} style={styles.listItemSkeleton}>
            <SkeletonLine
              width={60}
              height={60}
              style={styles.skeletonAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonLine
                width="70%"
                height={14}
                style={{ marginBottom: 6 }}
              />
              <SkeletonLine width="90%" height={12} />
            </View>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  skeletonLine: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  skeletonImage: {
    borderRadius: 12,
    marginBottom: 12,
  },
  padding: {
    padding: 12,
  },
  cartItemContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  skeletonAvatar: {
    borderRadius: 8,
  },
  listItemSkeleton: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
});
