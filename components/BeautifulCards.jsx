import { Ionicons } from "@expo/vector-icons";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

/**
 * Reusable Card Components
 * Consistent unified styling for the entire app
 */

export function PrimaryCard({
  title,
  subtitle,
  onPress,
  image,
  badge = null,
  icon = null,
  rightElement = null,
  animatePress = true,
  style = {},
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={animatePress ? 0.7 : 1}
      style={[styles.primaryCard, style]}
    >
      {image && <Image source={{ uri: image }} style={styles.cardImage} />}

      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          {title && (
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>

        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        {icon && <Ionicons name={icon} size={20} color="#2E7D32" />}
        {rightElement && rightElement}
      </View>
    </TouchableOpacity>
  );
}

export function ProductCard({
  name,
  price,
  image,
  rating = null,
  discount = null,
  onPress,
  onAddCart,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.productCard}
    >
      <View style={styles.productImageContainer}>
        {image && <Image source={{ uri: image }} style={styles.productImage} />}
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>

        {rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.rating}>{rating}</Text>
          </View>
        )}

        <Text style={styles.productPrice}>₹{price}</Text>

        {onAddCart && (
          <TouchableOpacity onPress={onAddCart} style={styles.addCartBtn}>
            <Ionicons name="add-circle-outline" size={18} color="#2E7D32" />
            <Text style={styles.addCartText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color = "#2E7D32",
  trend = null,
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueContainer}>
          <Text style={styles.statValue}>{value}</Text>
          {trend && (
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: trend > 0 ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              <Ionicons
                name={trend > 0 ? "arrow-up" : "arrow-down"}
                size={12}
                color={trend > 0 ? "#2E7D32" : "#C62828"}
              />
              <Text
                style={{
                  color: trend > 0 ? "#2E7D32" : "#C62828",
                  fontSize: 10,
                }}
              >
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function InfoCard({
  icon,
  title,
  message,
  actionText = null,
  onAction = null,
  type = "info", // 'info', 'warning', 'error', 'success'
}) {
  const typeStyles = {
    info: { bg: "#E3F2FD", border: "#1976D2" },
    warning: { bg: "#FFF3E0", border: "#F57C00" },
    error: { bg: "#FFEBEE", border: "#C62828" },
    success: { bg: "#E8F5E9", border: "#2E7D32" },
  };

  const style = typeStyles[type];

  return (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: style.bg, borderLeftColor: style.border },
      ]}
    >
      <View style={styles.infoCardContent}>
        <Ionicons
          name={icon}
          size={20}
          color={style.border}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: style.border }]}>
            {title}
          </Text>
          {message && <Text style={styles.infoMessage}>{message}</Text>}
        </View>
      </View>
      {actionText && (
        <TouchableOpacity onPress={onAction} style={styles.infoAction}>
          <Text style={{ color: style.border, fontWeight: "600" }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  primaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  cardContent: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: "#f5f5f5",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 8,
  },
  addCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCartText: {
    color: "#2E7D32",
    fontWeight: "600",
    marginLeft: 4,
  },

  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },

  infoCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  infoCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoMessage: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  infoAction: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
});

export default {
  PrimaryCard,
  ProductCard,
  StatCard,
  InfoCard,
};
