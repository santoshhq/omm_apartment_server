const sharp = require('sharp');

class LightweightImageCompression {
    
    // Super lightweight target for mobile loading (50KB max)
    static TARGET_SIZE_KB = 50;
    static TARGET_SIZE_BYTES = 50 * 1024;
    
    // Aggressive compression for Base64 images to make them super lightweight
    static async compressBase64ToLightweight(base64String) {
        try {
            console.log('\n=== ⚡ LIGHTWEIGHT IMAGE COMPRESSION ===');
            console.log('🎯 Target: Ultra-lightweight 50KB max');
            
            // Remove data URL prefix if present
            const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            const originalSizeKB = Math.round(buffer.length / 1024);
            console.log('📊 Original size:', originalSizeKB + 'KB');
            
            if (buffer.length <= this.TARGET_SIZE_BYTES) {
                console.log('✅ Already lightweight');
                return {
                    success: true,
                    compressedBase64: base64String,
                    originalSize: originalSizeKB,
                    finalSize: originalSizeKB
                };
            }
            
            // Get original metadata
            const metadata = await sharp(buffer).metadata();
            console.log('📏 Original dimensions:', metadata.width + 'x' + metadata.height);
            
            let compressedBuffer;
            let quality = 60; // Start with lower quality for lightweight
            let attempts = 0;
            const maxAttempts = 8;
            
            // Progressive compression with size reduction
            do {
                attempts++;
                console.log(`🔄 Lightweight attempt ${attempts}, quality: ${quality}`);
                
                // Calculate aggressive size reduction
                let targetWidth, targetHeight;
                
                if (attempts === 1) {
                    // First attempt: Moderate reduction
                    targetWidth = Math.min(600, metadata.width);
                    targetHeight = Math.min(400, metadata.height);
                } else if (attempts <= 3) {
                    // Early attempts: More aggressive
                    targetWidth = Math.min(400, metadata.width);
                    targetHeight = Math.min(300, metadata.height);
                } else {
                    // Later attempts: Very aggressive
                    const scaleFactor = Math.sqrt(this.TARGET_SIZE_BYTES / buffer.length);
                    targetWidth = Math.max(200, Math.round(metadata.width * scaleFactor * 0.7));
                    targetHeight = Math.max(150, Math.round(metadata.height * scaleFactor * 0.7));
                }
                
                compressedBuffer = await sharp(buffer)
                    .resize(targetWidth, targetHeight, {
                        fit: 'cover', // Better for thumbnails
                        withoutEnlargement: true
                    })
                    .jpeg({
                        quality: quality,
                        progressive: true,
                        mozjpeg: true,
                        optimizeScans: true,
                        trellisQuantisation: true,
                        overshootDeringing: true
                    })
                    .toBuffer();
                
                const currentSizeKB = Math.round(compressedBuffer.length / 1024);
                console.log(`📦 Attempt ${attempts}: ${currentSizeKB}KB (${targetWidth}x${targetHeight}, q:${quality})`);
                
                // Reduce quality more aggressively
                quality = Math.max(20, quality - 10);
                
            } while (compressedBuffer.length > this.TARGET_SIZE_BYTES && attempts < maxAttempts && quality >= 20);
            
            const finalSizeKB = Math.round(compressedBuffer.length / 1024);
            const compressionRatio = Math.round((1 - compressedBuffer.length / buffer.length) * 100);
            
            console.log('✅ LIGHTWEIGHT COMPRESSION COMPLETE');
            console.log('📊 Original:', originalSizeKB + 'KB');
            console.log('📦 Final:', finalSizeKB + 'KB');
            console.log('🎯 Ratio:', compressionRatio + '%');
            console.log('⚡ Ultra-lightweight:', finalSizeKB <= 50 ? 'YES' : 'CLOSE');
            
            // Convert back to base64
            const compressedBase64 = 'data:image/jpeg;base64,' + compressedBuffer.toString('base64');
            
            return {
                success: true,
                compressedBase64: compressedBase64,
                originalSize: originalSizeKB,
                finalSize: finalSizeKB,
                compressionRatio: compressionRatio,
                isLightweight: finalSizeKB <= 50,
                message: `Lightweight: ${originalSizeKB}KB → ${finalSizeKB}KB (${compressionRatio}% reduction)`
            };
            
        } catch (error) {
            console.log('❌ ERROR in lightweight compression:', error.message);
            return {
                success: false,
                error: error.message,
                compressedBase64: base64String // Return original if compression fails
            };
        }
    }
    
    // Compress multiple images to lightweight format
    static async compressMultipleToLightweight(imageArray) {
        if (!Array.isArray(imageArray)) {
            imageArray = [imageArray];
        }
        
        console.log('\n=== ⚡ BATCH LIGHTWEIGHT COMPRESSION ===');
        console.log('📊 Processing', imageArray.length, 'images for ultra-lightweight loading');
        
        const compressedImages = [];
        let totalOriginalSize = 0;
        let totalFinalSize = 0;
        
        for (let i = 0; i < imageArray.length; i++) {
            const image = imageArray[i];
            
            if (typeof image === 'string' && (image.startsWith('data:image/') || image.startsWith('http'))) {
                console.log(`\n📸 Compressing image ${i + 1}/${imageArray.length}`);
                
                let result;
                if (image.startsWith('data:image/')) {
                    result = await this.compressBase64ToLightweight(image);
                } else if (image.startsWith('http')) {
                    // For URLs, we'll just keep them as-is for now
                    result = {
                        success: true,
                        compressedBase64: image,
                        originalSize: 0,
                        finalSize: 0
                    };
                }
                
                if (result.success) {
                    compressedImages.push(result.compressedBase64);
                    totalOriginalSize += result.originalSize || 0;
                    totalFinalSize += result.finalSize || 0;
                } else {
                    console.log(`⚠️ Keeping original image ${i + 1}`);
                    compressedImages.push(image);
                }
            } else {
                console.log(`⚠️ Skipping non-image data ${i + 1}`);
                compressedImages.push(image);
            }
        }
        
        console.log('\n✅ BATCH LIGHTWEIGHT COMPRESSION COMPLETE');
        console.log('📊 Total original:', totalOriginalSize + 'KB');
        console.log('📦 Total final:', totalFinalSize + 'KB');
        console.log('💾 Total saved:', (totalOriginalSize - totalFinalSize) + 'KB');
        
        return {
            success: true,
            compressedImages: compressedImages,
            totalSaved: totalOriginalSize - totalFinalSize,
            processedCount: imageArray.length,
            message: `Batch compressed ${imageArray.length} images to ultra-lightweight format`
        };
    }
}

module.exports = LightweightImageCompression;