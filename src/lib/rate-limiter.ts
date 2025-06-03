"use client";

import { useState, useEffect } from "react";
import { RateLimiterState } from "./types";

// Constants for rate limiting
const MAX_TOKENS = 10; // Maximum number of tokens
const RESET_INTERVAL = 3600000; // Reset interval in milliseconds (1 hour)
const TOKEN_COST = 1; // Cost per generation

// Function to get the current rate limiter state from localStorage
const getRateLimiterState = (): RateLimiterState => {
  if (typeof window === "undefined") {
    // Default values for server-side rendering
    return { tokens: MAX_TOKENS, lastReset: Date.now() };
  }

  const stored = localStorage.getItem("contentgen_rate_limiter");
  if (!stored) {
    return { tokens: MAX_TOKENS, lastReset: Date.now() };
  }

  return JSON.parse(stored);
};

// Function to update the rate limiter state in localStorage
const updateRateLimiterState = (state: RateLimiterState): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("contentgen_rate_limiter", JSON.stringify(state));
};

// Custom hook for rate limiting
export const useRateLimiter = () => {
  const [state, setState] = useState<RateLimiterState>(getRateLimiterState);
  const [canGenerate, setCanGenerate] = useState<boolean>(true);
  const [nextResetTime, setNextResetTime] = useState<number>(0);

  // Initialize and check for resets
  useEffect(() => {
    const currentState = getRateLimiterState();
    const now = Date.now();
    const timeElapsed = now - currentState.lastReset;

    // Check if we need to reset tokens
    if (timeElapsed >= RESET_INTERVAL) {
      const newState = {
        tokens: MAX_TOKENS,
        lastReset: now,
      };
      updateRateLimiterState(newState);
      setState(newState);
    } else {
      setState(currentState);
      setNextResetTime(currentState.lastReset + RESET_INTERVAL);
    }
  }, []);

  // Update canGenerate whenever state changes
  useEffect(() => {
    setCanGenerate(state.tokens >= TOKEN_COST);
    setNextResetTime(state.lastReset + RESET_INTERVAL);
  }, [state]);

  // Function to consume tokens
  const consumeTokens = (amount: number = TOKEN_COST): boolean => {
    if (state.tokens < amount) return false;

    const newState = {
      ...state,
      tokens: state.tokens - amount,
    };
    
    updateRateLimiterState(newState);
    setState(newState);
    return true;
  };

  // Function to get time until next reset
  const getTimeUntilReset = (): number => {
    const now = Date.now();
    return Math.max(0, nextResetTime - now);
  };

  return {
    canGenerate,
    tokensRemaining: state.tokens,
    consumeTokens,
    timeUntilReset: getTimeUntilReset(),
    resetTime: nextResetTime,
  };
};
