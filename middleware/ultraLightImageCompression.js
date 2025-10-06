// Safe image handling - return original images to prevent corruption
class UltraLightImageCompression {
    
    // Instead of corrupting Base64, we'll return original images
    // and let the client handle compression if needed
    static compressBase64Image(base64String) {
        try {
            console.log('\n=== ⚡ SAFE IMAGE HANDLING ===');
            
            // Validate Base64 format first
            if (!base64String.startsWith('data:image/')) {
                console.log('❌ Not a valid Base64 image');
                return {
                    success: false,
                    error: 'Invalid Base64 image format',
                    compressedBase64: base64String
                };
            }
            
            const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
            const originalSize = Math.round((base64Data.length * 3) / 4 / 1024);
            
            console.log('📊 Image size:', originalSize + 'KB');
            console.log('✅ Returning original image (safe, no corruption)');
            
            // Return the original image to prevent corruption
            // The Flutter app can handle the image size
            return {
                success: true,
                compressedBase64: base64String, // Return original
                originalSize: originalSize,
                finalSize: originalSize,
                compressionRatio: 0, // No compression to prevent corruption
                message: `Safe handling: ${originalSize}KB (original quality preserved)`
            };
            
        } catch (error) {
            console.log('❌ ERROR in ultra-light compression:', error.message);
            return {
                success: false,
                error: error.message,
                compressedBase64: base64String // Return original if compression fails
            };
        }
    }
    
    // Compress multiple images for batch processing
    static compressMultipleImages(imageArray) {
        if (!Array.isArray(imageArray)) {
            imageArray = [imageArray];
        }
        
        console.log('\n=== ⚡ BATCH SAFE IMAGE HANDLING ===');
        console.log('📊 Processing', imageArray.length, 'images (preserving original quality)');
        
        const compressedImages = [];
        let totalOriginalSize = 0;
        let totalFinalSize = 0;
        
        for (let i = 0; i < imageArray.length; i++) {
            const image = imageArray[i];
            
            if (typeof image === 'string' && image.startsWith('data:image/')) {
                console.log(`\n📸 Compressing image ${i + 1}/${imageArray.length}`);
                
                const result = this.compressBase64Image(image);
                
                if (result.success) {
                    compressedImages.push(result.compressedBase64);
                    totalOriginalSize += result.originalSize || 0;
                    totalFinalSize += result.finalSize || 0;
                    console.log('✅', result.message);
                } else {
                    console.log(`⚠️ Keeping original image ${i + 1}:`, result.error);
                    compressedImages.push(image);
                }
            } else {
                // Keep non-Base64 images (URLs, etc.) as-is
                console.log(`⚠️ Skipping non-Base64 image ${i + 1}`);
                compressedImages.push(image);
            }
        }
        
        const totalSaved = totalOriginalSize - totalFinalSize;
        
        console.log('\n✅ BATCH SAFE HANDLING COMPLETE');
        console.log('📊 Total size:', totalOriginalSize + 'KB');
        console.log('✅ All images preserved safely (no corruption)');
        
        return {
            success: true,
            compressedImages: compressedImages,
            totalSaved: 0, // No compression to prevent corruption
            processedCount: imageArray.length,
            averageSizeKB: Math.round(totalOriginalSize / imageArray.length),
            message: `Safely handled ${imageArray.length} images (original quality preserved)`
        };
    }
}

module.exports = UltraLightImageCompression;