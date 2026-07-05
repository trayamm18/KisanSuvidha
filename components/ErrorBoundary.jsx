import { Ionicons } from "@expo/vector-icons";
import { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Error Boundary Component
 * Catches errors in child components and displays them gracefully
 */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service if needed
    console.error("Error Boundary caught error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconBox}>
              <Ionicons name="alert-circle-outline" size={64} color="#D32F2F" />
            </View>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We encountered an unexpected error. Please try again.
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.resetError}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            {__DEV__ && (
              <View style={styles.debugBox}>
                <Text style={styles.debugTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.debugText}>
                  {this.state.error?.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  content: {
    alignItems: "center",
  },
  iconBox: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  debugBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderColor: "#D32F2F",
    borderWidth: 1,
    maxWidth: "100%",
  },
  debugTitle: {
    color: "#D32F2F",
    fontWeight: "700",
    marginBottom: 8,
  },
  debugText: {
    color: "#666",
    fontSize: 12,
  },
});

export default ErrorBoundary;
