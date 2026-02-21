import sharp from "sharp";
import { encode } from "blurhash";
import cloudinary from "./cloudinary.js";

/**
 * Generate blurhash from an in-memory buffer (32×32 thumbnail).
 */
async function generateBlurHash(buffer) {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer((err, data, { width, height }) => {
        if (err) return reject(err);
        resolve(encode(new Uint8ClampedArray(data), width, height, 4, 4));
      });
  });
}

/**
 * Resize to max 1200px on either dimension and convert to WebP @ 78% quality.
 * Everything stays in RAM — no temp files.
 */
async function compressToWebP(inputBuffer) {
  return sharp(inputBuffer)
    .rotate()                                              // auto-correct EXIF orientation
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })                     // effort 4 = fast + good compression
    .toBuffer({ resolveWithObject: true });                // { data, info }
}

/**
 * Upload a Buffer to Cloudinary via upload_stream (no disk file).
 */
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", format: "webp", quality: "auto:good" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteImage(key) {
  try {
    await cloudinary.uploader.destroy(key);
    return true;
  } catch (err) {
    console.error("Error deleting cloudinary image:", err);
    return false;
  }
}

/**
 * Main pipeline:
 *   multer buffer → Sharp (resize + WebP) → Cloudinary stream → blurhash
 *   Zero disk I/O.
 */
export async function photoWork(photo) {
  try {
    const inputBuffer = photo.buffer; // multer memoryStorage provides this

    // 1. Compress in memory
    const { data: webpBuffer, info } = await compressToWebP(inputBuffer);

    // 2. Upload to Cloudinary via stream (parallel with blurhash)
    const [result, blurhash] = await Promise.all([
      uploadToCloudinary(webpBuffer),
      generateBlurHash(webpBuffer),
    ]);

    return {
      blurhash,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("photoWork error:", error.message);
    throw new Error(error.message);
  }
}
