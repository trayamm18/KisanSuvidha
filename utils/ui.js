import { Alert } from "react-native";

/**
 * Professional UI Utilities
 * Toast, confirmations, and safe operations
 */

export const showConfirmation = (
  title,
  message,
  onConfirm,
  onCancel = null,
  confirmText = "Confirm",
  cancelText = "Cancel",
) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      onPress: onCancel,
      style: "cancel",
    },
    {
      text: confirmText,
      onPress: onConfirm,
      style: "destructive",
    },
  ]);
};

export const showError = (
  title = "Error",
  message = "Something went wrong",
) => {
  Alert.alert(title, message, [{ text: "OK", style: "default" }]);
};

export const showSuccess = (message = "Success!") => {
  // In production, use Toast notification
  Alert.alert("Success", message, [{ text: "OK" }]);
};

export const showInfo = (title = "Info", message = "Information") => {
  Alert.alert(title, message, [{ text: "OK" }]);
};

/**
 * Safe Async Operation Wrapper
 * Handles loading, error, and success states
 */
export const safeAsync = async (
  operation,
  {
    onLoading = null,
    onError = null,
    onSuccess = null,
    showErrorAlert = true,
    errorMessage = "An error occurred",
  } = {},
) => {
  try {
    if (onLoading) onLoading(true);

    const result = await operation();

    if (onLoading) onLoading(false);
    if (onSuccess) onSuccess(result);

    return result;
  } catch (error) {
    if (onLoading) onLoading(false);

    if (onError) {
      onError(error);
    } else if (showErrorAlert) {
      showError("Error", error.message || errorMessage);
    }

    return null;
  }
};

/**
 * Retry Logic Wrapper
 * Automatically retries failed operations
 */
export const withRetry = async (operation, maxRetries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

/**
 * Debounce Function
 * Prevents multiple rapid calls
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle Function
 * Limits function calls to a specific interval
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  showConfirmation,
  showError,
  showSuccess,
  showInfo,
  safeAsync,
  withRetry,
  debounce,
  throttle,
};
