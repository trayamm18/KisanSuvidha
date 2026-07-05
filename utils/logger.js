/**
 * Professional Logging Utility
 * Use this instead of console.log in production
 */

const LOG_LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

const isDevelopment = __DEV__; // Only log in development

export const logDebug = (tag, message, data = null) => {
  if (isDevelopment) {
    console.log(`🔹 [${tag}] ${message}`, data || "");
  }
};

export const logInfo = (tag, message, data = null) => {
  if (isDevelopment) {
    console.log(`ℹ️ [${tag}] ${message}`, data || "");
  }
};

export const logWarn = (tag, message, data = null) => {
  if (isDevelopment) {
    console.warn(`⚠️ [${tag}] ${message}`, data || "");
  }
};

export const logError = (tag, message, error = null) => {
  if (isDevelopment) {
    console.error(`❌ [${tag}] ${message}`, error || "");
  }
};

// Non-development: errors can be sent to analytics service
export const reportError = async (tag, error, context = {}) => {
  // In production, you could send to Firebase Analytics, Sentry, etc.
  if (!isDevelopment) {
    // Example: sendToAnalytics({ tag, error, context });
  } else {
    logError(tag, error.message, error);
  }
};

export default {
  logDebug,
  logInfo,
  logWarn,
  logError,
  reportError,
};
