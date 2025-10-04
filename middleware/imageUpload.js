const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class ImageUploadMiddleware {
    
    // Configure multer for image uploads
    static configureMulter() {
        const storage = multer.memoryStorage(); // Store in memory for processing
        
        const fileFilter = (req, file, cb) => {
            // Check if file is an image
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed!'), false);
            }
        };

        return multer({
            storage: storage,
            fileFilter: fileFilter,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
                files: 5 // Maximum 5 files per request
            }
        });
    }

    // Compress and save image
    static async compressAndSaveImage(buffer, originalName, complaintId) {
        try {
            console.log('🖼️  Processing image:', originalName);
            
            // Generate unique filename
            const fileExtension = path.extname(originalName).toLowerCase();
            const fileName = `${complaintId}_${uuidv4()}${fileExtension}`;
            
            // Define paths
            const originalPath = path.join(__dirname, '../uploads/images/complaints', fileName);
            const compressedPath = path.join(__dirname, '../uploads/images/compressed', fileName);
            
            // Ensure directories exist
            await fs.ensureDir(path.dirname(originalPath));
            await fs.ensureDir(path.dirname(compressedPath));
            
            // Save original image
            await fs.writeFile(originalPath, buffer);
            
            // Get image metadata
            const metadata = await sharp(buffer).metadata();
            console.log('📊 Original image info:', {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: Math.round(buffer.length / 1024) + 'KB'
            });
            
            // Compress image based on size and format
            let compressedBuffer;
            const maxWidth = 1200;
            const maxHeight = 1200;
            const quality = 80;
            
            if (metadata.format === 'png') {
                compressedBuffer = await sharp(buffer)
                    .resize(maxWidth, maxHeight, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .png({ 
                        quality: quality,
                        compressionLevel: 8,
                        progressive: true
                    })
                    .toBuffer();
            } else {
                // Convert to JPEG for better compression
                compressedBuffer = await sharp(buffer)
                    .resize(maxWidth, maxHeight, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .jpeg({ 
                        quality: quality,
                        progressive: true,
                        mozjpeg: true
                    })
                    .toBuffer();
            }
            
            // Save compressed image
            await fs.writeFile(compressedPath, compressedBuffer);
            
            // Get compressed metadata
            const compressedMetadata = await sharp(compressedBuffer).metadata();
            const compressionRatio = Math.round((1 - compressedBuffer.length / buffer.length) * 100);
            
            console.log('✅ Compressed image info:', {
                width: compressedMetadata.width,
                height: compressedMetadata.height,
                format: compressedMetadata.format,
                originalSize: Math.round(buffer.length / 1024) + 'KB',
                compressedSize: Math.round(compressedBuffer.length / 1024) + 'KB',
                compressionRatio: compressionRatio + '%'
            });
            
            return {
                originalPath: originalPath,
                compressedPath: compressedPath,
                fileName: fileName,
                originalSize: buffer.length,
                compressedSize: compressedBuffer.length,
                compressionRatio: compressionRatio,
                dimensions: {
                    width: compressedMetadata.width,
                    height: compressedMetadata.height
                }
            };
            
        } catch (error) {
            console.error('❌ Error processing image:', error.message);
            throw new Error('Failed to process image: ' + error.message);
        }
    }

    // Middleware for handling multiple image uploads
    static uploadImages() {
        const upload = this.configureMulter();
        
        return (req, res, next) => {
            console.log('\n=== 🖼️  IMAGE UPLOAD MIDDLEWARE CALLED ===');
            console.log('📋 Request Content-Type:', req.get('Content-Type'));
            
            upload.array('images', 5)(req, res, async (err) => {
                console.log('📋 Request Body Keys after multer:', req.body ? Object.keys(req.body) : 'No body');
                if (err) {
                    console.error('❌ Multer error:', err.message);
                    return res.status(400).json({
                        success: false,
                        message: 'Image upload error: ' + err.message
                    });
                }
                
                console.log('📁 Files received by multer:', req.files ? req.files.length : 0);
                console.log('📁 File details:', req.files ? req.files.map(f => ({
                    fieldname: f.fieldname,
                    originalname: f.originalname,
                    mimetype: f.mimetype,
                    size: Math.round(f.size / 1024) + 'KB'
                })) : 'No files');
                
                if (!req.files || req.files.length === 0) {
                    console.log('⚠️  No files detected - continuing without image processing');
                    return next(); // No images uploaded, continue
                }
                
                try {
                    const processedImages = [];
                    const complaintId = req.body.complaintId || 'unknown';
                    
                    console.log(`🖼️  Processing ${req.files.length} images for complaint: ${complaintId}`);
                    
                    for (const file of req.files) {
                        const imageData = await this.compressAndSaveImage(
                            file.buffer, 
                            file.originalname, 
                            complaintId
                        );
                        
                        processedImages.push({
                            originalName: file.originalname,
                            fileName: imageData.fileName,
                            originalPath: imageData.originalPath,
                            compressedPath: imageData.compressedPath,
                            originalSize: imageData.originalSize,
                            compressedSize: imageData.compressedSize,
                            compressionRatio: imageData.compressionRatio,
                            dimensions: imageData.dimensions,
                            mimetype: file.mimetype
                        });
                    }
                    
                    req.processedImages = processedImages;
                    console.log('✅ All images processed successfully');
                    next();
                    
                } catch (error) {
                    console.error('❌ Error processing images:', error.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to process images: ' + error.message
                    });
                }
            });
        };
    }

    // Clean up temporary files
    static async cleanupFiles(filePaths) {
        try {
            for (const filePath of filePaths) {
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                    console.log('🗑️  Cleaned up file:', path.basename(filePath));
                }
            }
        } catch (error) {
            console.error('⚠️  Error cleaning up files:', error.message);
        }
    }
}

module.exports = ImageUploadMiddleware;