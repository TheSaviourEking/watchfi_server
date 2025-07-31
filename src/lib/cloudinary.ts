"use server";

import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'buffer';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Debug function to test Cloudinary configuration
export async function testCloudinaryConfig(): Promise<{ success: boolean; message: string }> {
    try {
        const config = cloudinary.config();
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            return {
                success: false,
                message: `Missing config: cloud_name=${!!config.cloud_name}, api_key=${!!config.api_key}, api_secret=${!!config.api_secret}`
            };
        }
        const result = await cloudinary.api.ping();
        return {
            success: true,
            message: `Cloudinary connection successful: ${JSON.stringify(result)}`
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            message: `Cloudinary connection failed: ${errorMessage}`
        };
    }
}

// Upload a single file to Cloudinary (handles Buffer from Fastify multipart)
export async function uploadToCloudinary(
    fileData: Buffer,
    fileInfo: { name?: string; mimetype?: string },
    folder: string = 'watchfi',
    options: {
        maxFileSize?: number;
        timeout?: number;
        quality?: string;
        maxWidth?: number;
        maxHeight?: number;
    } = {}
): Promise<string> {
    const {
        maxFileSize = 5 * 1024 * 1024, // Match Fastify limit
        timeout = 30000,
        quality = 'auto',
        maxWidth = 1500,
        maxHeight = 1500
    } = options;

    try {
        const config = cloudinary.config();
        console.log('Cloudinary config check:', {
            cloud_name: !!config.cloud_name,
            api_key: !!config.api_key,
            api_secret: !!config.api_secret,
            secure: config.secure
        });

        if (fileData.length > maxFileSize) {
            throw new Error(`File size ${Math.round(fileData.length / 1024 / 1024)}MB exceeds maximum allowed size of ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        }

        if (!fileInfo.mimetype || !fileInfo.mimetype.startsWith('image/')) {
            throw new Error(`Invalid or missing file type: ${fileInfo.mimetype || 'unknown'}. Only images are allowed.`);
        }

        const fileName = fileInfo.name || `unnamed_${Date.now()}`;
        console.log(`Starting upload for ${fileName} (${Math.round(fileData.length / 1024)}KB)`);

        const uploadPromise = new Promise<string>((resolve, reject) => {
            const uploadOptions = {
                resource_type: "image" as const,
                folder,
                quality,
                width: maxWidth,
                height: maxHeight,
                crop: 'limit',
                format: 'webp',
                flags: 'progressive',
            };

            console.log('Upload options:', uploadOptions);

            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error details:', {
                            message: error.message,
                            http_code: error.http_code,
                            name: error.name,
                            error
                        });
                        reject(error);
                    } else if (result) {
                        console.log(`Upload successful: ${result.secure_url}`);
                        resolve(result.secure_url);
                    } else {
                        console.error('No result returned from upload');
                        reject(new Error('Upload failed: No result returned'));
                    }
                }
            );

            uploadStream.on('error', (streamError) => {
                console.error('Upload stream error:', streamError);
                reject(streamError);
            });

            uploadStream.end(fileData);
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Upload timeout after ${timeout / 1000} seconds`));
            }, timeout);
        });

        return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (error) {
        console.error('Upload error details:', {
            fileName: fileInfo.name || 'unknown',
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
}

// Upload multiple files to Cloudinary
export async function uploadMultipleToCloudinary(
    files: Array<{ data: Buffer; name: string; mimetype: string }>,
    folder: string = 'watchfi',
    options?: Parameters<typeof uploadToCloudinary>[3]
): Promise<string[]> {
    const results: string[] = [];
    console.log(`Starting sequential upload of ${files.length} files...`);

    for (let i = 0; i < files.length; i++) {
        try {
            console.log(`Uploading file ${i + 1}/${files.length}: ${files[i].name}`);
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            }
            const url = await uploadToCloudinary(files[i].data, { name: files[i].name, mimetype: files[i].mimetype }, folder, options);
            results.push(url);
            console.log(`File ${i + 1} uploaded successfully`);
        } catch (error) {
            console.error(`Failed to upload ${files[i].name}:`, error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Failed to upload ${files[i].name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    console.log(`Batch upload completed. ${results.length} files uploaded.`);
    return results;
}

// Extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url: string): string {
    try {
        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL: No "upload" segment found');
        }
        const startIndex = uploadIndex + 1;
        const versionIndex = urlParts[startIndex].startsWith('v') && !isNaN(Number(urlParts[startIndex].slice(1))) ? startIndex + 1 : startIndex;
        const publicIdParts = urlParts.slice(versionIndex, urlParts.length - 1).concat(urlParts[urlParts.length - 1].split('.')[0]);
        const publicId = publicIdParts.join('/');
        if (!publicId) {
            throw new Error('Could not extract public_id from URL');
        }
        return publicId;
    } catch (error) {
        console.error('Error extracting public_id from URL:', url, error);
        throw new Error(`Invalid Cloudinary URL format: ${url}`);
    }
}

// Delete a single image from Cloudinary
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
    try {
        const publicId = extractPublicIdFromUrl(imageUrl);
        console.log(`Deleting image with public_id: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
            invalidate: true,
        });
        console.log(`Deletion result for ${publicId}:`, result);
        if (result.result === 'ok') {
            console.log(`Image deleted successfully: ${publicId}`);
            return true;
        }
        console.error(`Failed to delete image: ${publicId}, result:`, result);
        throw new Error(`Failed to delete image: ${result.result}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Delete multiple images from Cloudinary
export async function deleteMultipleFromCloudinary(imageUrls: string[]): Promise<{ successful: number; failed: number; errors: string[] }> {
    const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
    };
    console.log(`Starting deletion of ${imageUrls.length} images...`);

    try {
        const publicIds = imageUrls.map(url => extractPublicIdFromUrl(url));
        console.log(`Bulk deleting ${publicIds.length} images:`, publicIds);

        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < publicIds.length; i += batchSize) {
            batches.push(publicIds.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            const result = await cloudinary.api.delete_resources(batch, {
                resource_type: 'image',
                invalidate: true,
            });
            console.log(`Bulk delete batch result:`, result);
            Object.entries(result.deleted).forEach(([publicId, status]) => {
                if (status === 'deleted') {
                    results.successful++;
                    console.log(`Deleted ${publicId}`);
                } else {
                    results.failed++;
                    results.errors.push(`Failed to delete ${publicId}: ${status}`);
                    console.error(`Failed to delete ${publicId}: ${status}`);
                }
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed += imageUrls.length - results.successful;
        results.errors.push(`Bulk deletion error: ${errorMessage}`);
        console.error('Bulk deletion failed:', error);
    }

    console.log(`Deletion completed: ${results.successful} successful, ${results.failed} failed`);
    if (results.failed > 0) {
        throw new Error(`${results.failed} deletions failed:\n${results.errors.join('\n')}`);
    }
    return results;
}