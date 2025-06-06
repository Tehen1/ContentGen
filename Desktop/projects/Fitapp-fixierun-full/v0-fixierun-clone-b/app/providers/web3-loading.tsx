"use client";

import React from "react";

interface Web3LoadingProps {
  message?: string;
}

/**
 * Loading component for Web3 connection states
 * Displays a loading spinner with a customizable message
 */
export function Web3Loading({ message = "Connecting to Web3..." }: Web3LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
    </div>
  );
}

