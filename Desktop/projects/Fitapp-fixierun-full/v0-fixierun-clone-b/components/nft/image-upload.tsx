"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { uploadNFTImage } from "@/app/actions/nft-image-actions"
import { rarityLevels, type RarityLevel } from "@/utils/rarity-constants"
import { processImageWithCanvas } from "@/utils/image-processor"

type ImageUploadProps = {
  onImageUploaded: (imagePath: string) => void
  rarityLevel: RarityLevel
  bikeName: string
}

export default function ImageUpload({ onImageUploaded, rarityLevel, bikeName }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | "info" | null
    message: string
  }>({ type: null, message: "" })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = useCallback(
    async (selectedFile: File) => {
      if (selectedFile) {
        setFile(selectedFile)

        // Create original preview
        const originalUrl = URL.createObjectURL(selectedFile)
        setOriginalPreview(originalUrl)

        // Generate processed preview
        setIsProcessing(true)
        try {
          // Process image with canvas
          const processedImageData = await processImageWithCanvas(selectedFile, rarityLevel)
          setPreview(processedImageData)
        } catch (error) {
          console.error("Error processing image:", error)
          setUploadStatus({
            type: "error",
            message: "Error processing image",
          })
          // Fall back to original preview
          setPreview(originalUrl)
        } finally {
          setIsProcessing(false)
        }
      }
    },
    [rarityLevel],
  )

  // Update preview when rarity level changes
  useEffect(() => {
    if (file) {
      handleFileChange(file)
    }
  }, [rarityLevel, file, handleFileChange])

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (originalPreview && originalPreview.startsWith("blob:")) {
        URL.revokeObjectURL(originalPreview)
      }
    }
  }, [originalPreview])

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const droppedFile = files[0]

      // Check if it's an image
      if (!droppedFile.type.startsWith("image/")) {
        setUploadStatus({
          type: "error",
          message: "Please upload an image file",
        })
        return
      }

      handleFileChange(droppedFile)
    }
  }

  // Handle file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileChange(files[0])
    }
  }

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !preview) return

    setIsUploading(true)
    setUploadStatus({ type: "info", message: "Uploading image..." })

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("rarityLevel", rarityLevel)
      formData.append("bikeName", bikeName)
      formData.append("processedImageData", preview)

      const result = await uploadNFTImage(formData)

      if (result.success && result.path) {
        setUploadStatus({
          type: "success",
          message: `Image uploaded successfully as ${result.newFilename}`,
        })
        onImageUploaded(result.path)
      } else {
        setUploadStatus({
          type: "error",
          message: result.message || "Failed to upload image",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadStatus({
        type: "error",
        message: "Error uploading image",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file removal
  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    if (originalPreview && originalPreview.startsWith("blob:")) {
      URL.revokeObjectURL(originalPreview)
    }
    setOriginalPreview(null)
    setUploadStatus({ type: null, message: "" })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Get rarity color for styling
  const rarityColor = rarityLevels[rarityLevel].glowColor

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging ? "border-accent bg-accent/10" : "border-gray-600 hover:border-accent/50 bg-cyberpunk-darker/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input type="file" ref={fileInputRef} onChange={handleInputChange} accept="image/*" className="hidden" />

        {!preview ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className="w-16 h-16 mb-4 rounded-full bg-accent/20 flex items-center justify-center"
              style={{ boxShadow: `0 0 15px ${rarityColor}` }}
            >
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-cyber font-bold mb-2 text-white">Upload Bike Image</h3>
            <p className="text-sm text-gray-400 text-center mb-4 max-w-md">
              Drag and drop your image here, or click to browse. The image will be processed with{" "}
              <span className="font-bold" style={{ color: rarityColor }}>
                {rarityLevels[rarityLevel].name}
              </span>{" "}
              rarity effects.
            </p>
            <button
              onClick={handleButtonClick}
              className="cyber-button px-4 py-2 text-sm font-bold"
              style={{ boxShadow: `0 0 10px ${rarityColor}` }}
            >
              Select Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square mb-4 group">
              <div className="absolute inset-0 rounded-lg" style={{ boxShadow: `0 0 20px ${rarityColor}` }}></div>

              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-cyberpunk-darker/80 rounded-lg"
                  >
                    <RefreshCw className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-white font-cyber absolute mt-16">Processing image...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={showOriginal && originalPreview ? originalPreview : preview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />

                    {/* Toggle button to show original/processed */}
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="absolute bottom-2 right-2 bg-cyberpunk-darker/80 text-white text-xs px-2 py-1 rounded-sm border border-accent/30"
                    >
                      {showOriginal ? "Show Processed" : "Show Original"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={isUploading || isProcessing}
                className={`cyber-button px-4 py-2 text-sm font-bold ${
                  isUploading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{ boxShadow: `0 0 10px ${rarityColor}` }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Image"
                )}
              </button>

              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-bold border border-gray-600 rounded-sm hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status message */}
      <AnimatePresence>
        {uploadStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-sm flex items-start ${
              uploadStatus.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : uploadStatus.type === "error"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            }`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : uploadStatus.type === "error" ? (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin flex-shrink-0" />
            )}
            <span>{uploadStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
