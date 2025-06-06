"use server"

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { mkdir } from 'fs/promises'
import { RarityLevel } from '@/utils/rarity-constants'

/**
 * Uploads an NFT image, saving both the original and processed versions
 * @param formData Form data containing the image file and metadata
 * @returns Object with upload status and path information
 */
export async function uploadNFTImage(formData: FormData): Promise<{
  success: boolean
  path?: string
  newFilename?: string
  message?: string
}> {
  try {
    // Extract data from the form
    const file = formData.get('file') as File
    const rarityLevel = formData.get('rarityLevel') as RarityLevel
    const bikeName = formData.get('bikeName') as string
    const processedImageData = formData.get('processedImageData') as string

    if (!file || !rarityLevel || !bikeName || !processedImageData) {
      return {
        success: false,
        message: 'Missing required data for upload',
      }
    }

    // Create unique filename based on bike name and UUID
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const sanitizedBikeName = bikeName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const uniqueId = uuidv4().substring(0, 8)
    const newFilename = `${sanitizedBikeName}-${rarityLevel}-${uniqueId}.${fileExtension}`

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'nft-bikes')
    await mkdir(uploadDir, { recursive: true })

    // Save the processed image (which is a data URL) to a file
    const processedImagePath = path.join(uploadDir, newFilename)
    
    // Convert data URL to buffer and save
    const base64Data = processedImageData.split(',')[1]
    if (!base64Data) {
      return {
        success: false,
        message: 'Invalid processed image data',
      }
    }
    
    // Write the image to disk
    fs.writeFileSync(processedImagePath, Buffer.from(base64Data, 'base64'))

    // Return success with the public path to the image
    const publicPath = `/uploads/nft-bikes/${newFilename}`
    
    return {
      success: true,
      path: publicPath,
      newFilename,
    }
  } catch (error) {
    console.error('Error in uploadNFTImage:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during upload',
    }
  }
}
