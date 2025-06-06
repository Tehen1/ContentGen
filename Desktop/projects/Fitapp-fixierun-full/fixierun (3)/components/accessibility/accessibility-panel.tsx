"use client"

import { useState } from "react"
import { useAccessibility } from "@/hooks/use-accessibility"
import { useTranslation } from "@/contexts/translation-context"
import { Type, PlusIcon as TypePlus, MinusIcon as TypeMinus, Contrast, WandSparkles, Sparkles, X } from "lucide-react"

/**
 * Accessibility panel component
 * Provides controls for adjusting accessibility settings
 *
 * @returns {JSX.Element} The accessibility panel component
 */
export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const { settings, increaseFontSize, decreaseFontSize, toggleHighContrast, toggleReducedMotion, resetSettings } =
    useAccessibility()

  return (
    <>
      {/* Accessibility toggle button */}
      <button
        aria-label={t("accessibilitySettings")}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        <WandSparkles size={24} />
      </button>

      {/* Accessibility panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
            className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
          >
            <button
              aria-label={t("close")}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>

            <h2 id="accessibility-title" className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("accessibilitySettings")}
            </h2>

            <div className="space-y-6">
              {/* Font size controls */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center text-gray-900 dark:text-white">
                  <Type className="mr-2" size={20} />
                  {t("fontSize")}
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    aria-label={t("decreaseText")}
                    className="p-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={decreaseFontSize}
                    disabled={settings.fontSize <= 0.8}
                  >
                    <TypeMinus size={20} />
                  </button>
                  <div className="flex-1 text-center">{Math.round((settings.fontSize - 1) * 100)}%</div>
                  <button
                    aria-label={t("increaseText")}
                    className="p-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={increaseFontSize}
                    disabled={settings.fontSize >= 1.4}
                  >
                    <TypePlus size={20} />
                  </button>
                </div>
              </div>

              {/* High contrast toggle */}
              <div>
                <button
                  className={`flex items-center justify-between w-full p-3 rounded-md ${
                    settings.highContrast
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                  onClick={toggleHighContrast}
                >
                  <span className="flex items-center">
                    <Contrast className="mr-2" size={20} />
                    {t("highContrast")}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      settings.highContrast
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    }`}
                  >
                    {settings.highContrast ? t("on") : t("off")}
                  </span>
                </button>
              </div>

              {/* Reduced motion toggle */}
              <div>
                <button
                  className={`flex items-center justify-between w-full p-3 rounded-md ${
                    settings.reducedMotion
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                  onClick={toggleReducedMotion}
                >
                  <span className="flex items-center">
                    <Sparkles className="mr-2" size={20} />
                    {t("reducedMotion")}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      settings.reducedMotion
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    }`}
                  >
                    {settings.reducedMotion ? t("on") : t("off")}
                  </span>
                </button>
              </div>

              {/* Reset button */}
              <div className="pt-2">
                <button
                  className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={resetSettings}
                >
                  {t("resetSettings")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
