import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Make sure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
const propertyImagesDir = path.join(uploadDir, 'properties');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(propertyImagesDir)) {
  fs.mkdirSync(propertyImagesDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, propertyImagesDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Configure upload settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

// Process uploaded image to optimize it
export async function processImage(filePath: string, options = { width: 1200, height: 800, quality: 80 }) {
  try {
    const { width, height, quality } = options;
    
    // Get the file extension to determine output format
    const ext = path.extname(filePath).toLowerCase();
    let outputFormat: keyof sharp.FormatEnum = 'jpeg'; // Default format
    
    if (ext === '.png') outputFormat = 'png';
    if (ext === '.webp') outputFormat = 'webp';
    
    // Process the image
    const processedFilePath = filePath.replace(ext, `_processed${ext}`);
    
    await sharp(filePath)
      .resize({
        width: width,
        height: height,
        fit: sharp.fit.inside, // Maintain aspect ratio
        withoutEnlargement: true // Don't enlarge if smaller than target
      })
      .toFormat(outputFormat, { quality })
      .toFile(processedFilePath);
    
    // Replace original with processed
    fs.unlinkSync(filePath);
    fs.renameSync(processedFilePath, filePath);
    
    return filePath;
  } catch (error) {
    console.error('Error processing image:', error);
    return filePath; // Return original path if processing fails
  }
}

// Function to get public URL for an image
export function getImageUrl(filename: string): string {
  return `/uploads/properties/${filename}`;
}

export { upload };