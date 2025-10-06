const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

class EventImageCompression {
    
    // Target size for event images (200KB)
    static TARGET_SIZE_KB = 200;
    static TARGET_SIZE_BYTES = 200 * 1024;
    
    // Compress Base64 image to target size (200KB)
    static async compressBase64Image(base64String, adminId) {
        try {
            console.log('\n=== 🖼️ EVENT IMAGE COMPRESSION CALLED ===');
            console.log('🎯 Target size: 200KB');
            
            // Remove data URL prefix if present
            const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            console.log('📊 Original image size:', Math.round(buffer.length / 1024) + 'KB');
            
            if (buffer.length <= this.TARGET_SIZE_BYTES) {
                console.log('✅ Image already under 200KB, no compression needed');
                return {
                    success: true,
                    compressedBase64: base64String,
                    originalSize: Math.round(buffer.length / 1024),
                    finalSize: Math.round(buffer.length / 1024),
                    compressionRatio: 0,
                    message: 'No compression needed - already under 200KB'
                };
            }
            
            // Get original metadata
            const metadata = await sharp(buffer).metadata();
            console.log('📏 Original dimensions:', metadata.width + 'x' + metadata.height);
            
            let compressedBuffer;
            let quality = 85;
            let attempts = 0;
            const maxAttempts = 10;
            
            // Iteratively compress until we reach target size
            do {
                attempts++;
                console.log(`🔄 Compression attempt ${attempts}, quality: ${quality}`);
                
                // Calculate dimensions to maintain aspect ratio
                let targetWidth = metadata.width;
                let targetHeight = metadata.height;
                
                // Reduce dimensions if quality is getting too low
                if (quality < 60) {
                    const scaleFactor = Math.sqrt(this.TARGET_SIZE_BYTES / buffer.length);
                    targetWidth = Math.round(metadata.width * scaleFactor * 0.9);
                    targetHeight = Math.round(metadata.height * scaleFactor * 0.9);
                    quality = 70; // Reset quality when reducing size
                }
                
                compressedBuffer = await sharp(buffer)
                    .resize(targetWidth, targetHeight, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({
                        quality: quality,
                        progressive: true,
                        mozjpeg: true
                    })
                    .toBuffer();
                
                console.log(`📦 Attempt ${attempts} result: ${Math.round(compressedBuffer.length / 1024)}KB`);
                
                // Reduce quality for next attempt
                quality -= 8;
                
            } while (compressedBuffer.length > this.TARGET_SIZE_BYTES && attempts < maxAttempts && quality > 20);
            
            const finalSizeKB = Math.round(compressedBuffer.length / 1024);
            const originalSizeKB = Math.round(buffer.length / 1024);
            const compressionRatio = Math.round((1 - compressedBuffer.length / buffer.length) * 100);
            
            console.log('✅ COMPRESSION COMPLETE');
            console.log('📊 Original size:', originalSizeKB + 'KB');
            console.log('📦 Final size:', finalSizeKB + 'KB');
            console.log('🎯 Compression ratio:', compressionRatio + '%');
            console.log('✅ Target achieved:', finalSizeKB <= 200 ? 'YES' : 'NO');
            
            // Convert back to base64
            const compressedBase64 = 'data:image/jpeg;base64,' + compressedBuffer.toString('base64');
            
            return {
                success: true,
                compressedBase64: compressedBase64,
                originalSize: originalSizeKB,
                finalSize: finalSizeKB,
                compressionRatio: compressionRatio,
                attempts: attempts,
                targetAchieved: finalSizeKB <= 200,
                message: `Image compressed from ${originalSizeKB}KB to ${finalSizeKB}KB (${compressionRatio}% reduction)`
            };
            
        } catch (error) {
            console.log('❌ ERROR in compressBase64Image:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to compress image'
            };
        }
    }
    
    // Compress multiple Base64 images
    static async compressMultipleImages(imageArray, adminId) {
        try {
            console.log('\n=== 🖼️ MULTIPLE EVENT IMAGES COMPRESSION ===');
            console.log('📊 Processing', imageArray.length, 'images');
            
            const compressedImages = [];
            let totalOriginalSize = 0;
            let totalFinalSize = 0;
            
            for (let i = 0; i < imageArray.length; i++) {
                const image = imageArray[i];
                console.log(`\n📸 Processing image ${i + 1}/${imageArray.length}`);
                
                const result = await this.compressBase64Image(image, adminId);
                
                if (result.success) {
                    compressedImages.push(result.compressedBase64);
                    totalOriginalSize += result.originalSize;
                    totalFinalSize += result.finalSize;
                } else {
                    console.log(`❌ Failed to compress image ${i + 1}:`, result.error);
                    // Keep original if compression fails
                    compressedImages.push(image);
                }
            }
            
            console.log('\n✅ BATCH COMPRESSION COMPLETE');
            console.log('📊 Total original size:', totalOriginalSize + 'KB');
            console.log('📦 Total final size:', totalFinalSize + 'KB');
            console.log('🎯 Total saved:', (totalOriginalSize - totalFinalSize) + 'KB');
            
            return {
                success: true,
                compressedImages: compressedImages,
                totalOriginalSize: totalOriginalSize,
                totalFinalSize: totalFinalSize,
                totalSaved: totalOriginalSize - totalFinalSize,
                processedCount: imageArray.length,
                message: `Compressed ${imageArray.length} images. Total size reduced from ${totalOriginalSize}KB to ${totalFinalSize}KB`
            };
            
        } catch (error) {
            console.log('❌ ERROR in compressMultipleImages:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to compress multiple images'
            };
        }
    }
    
    // Compress URL-based image (download, compress, return base64)
    static async compressImageFromURL(imageUrl, adminId) {
        try {
            console.log('\n=== 🌐 URL IMAGE COMPRESSION ===');
            console.log('🔗 URL:', imageUrl);
            
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
            }
            
            const buffer = await response.buffer();
            const base64 = 'data:image/jpeg;base64,' + buffer.toString('base64');
            
            return await this.compressBase64Image(base64, adminId);
            
        } catch (error) {
            console.log('❌ ERROR in compressImageFromURL:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to compress image from URL'
            };
        }
    }
    
    // Auto-detect image format and compress accordingly
    static async compressEventImages(images, adminId) {
        try {
            console.log('\n=== 🎪 EVENT IMAGES AUTO-COMPRESSION ===');
            console.log('🔍 Detecting image format...');
            
            if (!images) {
                console.log('ℹ️ No images provided');
                return {
                    success: true,
                    compressedImages: [],
                    message: 'No images to compress'
                };
            }
            
            // Handle single image or array
            const imageArray = Array.isArray(images) ? images : [images];
            const compressedImages = [];
            let totalSaved = 0;
            
            for (let i = 0; i < imageArray.length; i++) {
                const image = imageArray[i];
                console.log(`\n📸 Processing image ${i + 1}/${imageArray.length}`);
                
                let result;
                
                // Check image format
                if (typeof image === 'string') {
                    if (image.startsWith('data:image/')) {
                        // Base64 image
                        console.log('🔍 Detected: Base64 image');
                        result = await this.compressBase64Image(image, adminId);
                    } else if (image.startsWith('http://') || image.startsWith('https://')) {
                        // URL image
                        console.log('🔍 Detected: URL image');
                        result = await this.compressImageFromURL(image, adminId);
                    } else {
                        // Unknown format, keep as is
                        console.log('⚠️ Unknown image format, keeping original');
                        result = {
                            success: true,
                            compressedBase64: image,
                            message: 'Unknown format - kept original'
                        };
                    }
                } else {
                    // Non-string format, keep as is
                    console.log('⚠️ Non-string image format, keeping original');
                    result = {
                        success: true,
                        compressedBase64: image,
                        message: 'Non-string format - kept original'
                    };
                }
                
                if (result.success) {
                    compressedImages.push(result.compressedBase64);
                    if (result.originalSize && result.finalSize) {
                        totalSaved += (result.originalSize - result.finalSize);
                    }
                } else {
                    console.log(`❌ Failed to compress image ${i + 1}, keeping original`);
                    compressedImages.push(image);
                }
            }
            
            console.log('\n✅ AUTO-COMPRESSION COMPLETE');
            console.log('📊 Images processed:', imageArray.length);
            console.log('💾 Total space saved:', totalSaved + 'KB');
            
            // Return single image or array based on input
            const finalResult = Array.isArray(images) ? compressedImages : compressedImages[0];
            
            return {
                success: true,
                compressedImages: finalResult,
                processedCount: imageArray.length,
                totalSaved: totalSaved,
                message: `Successfully compressed ${imageArray.length} event images. Total space saved: ${totalSaved}KB`
            };
            
        } catch (error) {
            console.log('❌ ERROR in compressEventImages:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to auto-compress event images',
                compressedImages: images // Return original images if compression fails
            };
        }
    }
}

module.exports = EventImageCompression;