/**
 * Improved logging utilities for readable output in console
 */

export function logInfo(message: string, data?: any) {
  if (data !== undefined) {
    // Pretty print objects and arrays
    console.info(message, typeof data === "object" ? JSON.stringify(data, null, 2) : data);
  } else {
    console.info(message);
  }
}

export function logWarn(message: string, data?: any) {
  if (data !== undefined) {
    console.warn(message, typeof data === "object" ? JSON.stringify(data, null, 2) : data);
  } else {
    console.warn(message);
  }
}

export function logError(message: string, error?: any) {
  if (error !== undefined) {
    if (error instanceof Error) {
      console.error(message, error.message, error.stack);
    } else {
      console.error(message, typeof error === "object" ? JSON.stringify(error, null, 2) : error);
    }
  } else {
    console.error(message);
  }
}