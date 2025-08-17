import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
  progressive?: boolean;
}

export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly DEFAULT_FORMAT = 'webp';

  /**
   * Optimize a single image file
   */
  static async optimizeImage(
    inputPath: string, 
    outputPath: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<{ originalSize: number; optimizedSize: number; savings: number }> {
    try {
      const {
        quality = this.DEFAULT_QUALITY,
        width,
        height,
        format = this.DEFAULT_FORMAT,
        progressive = true
      } = options;

      // Get original file size
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      // Create Sharp instance
      let sharpInstance = sharp(inputPath);

      // Resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Apply format-specific optimizations
      switch (format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality,
            effort: 6 // Higher effort for better compression
          });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ 
            quality,
            progressive
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            compressionLevel: 9
          });
          break;
      }

      // Process and save
      await sharpInstance.toFile(outputPath);

      // Get optimized file size
      const optimizedStats = await fs.stat(outputPath);
      const optimizedSize = optimizedStats.size;
      const savings = ((originalSize - optimizedSize) / originalSize) * 100;

      return {
        originalSize,
        optimizedSize,
        savings
      };
    } catch (error) {
      // // console.error('Image optimization failed:', error);
      throw error;
    }
  }

  /**
   * Generate multiple optimized versions of an image
   */
  static async generateResponsiveImages(
    inputPath: string,
    outputDir: string,
    basename: string
  ): Promise<{ [key: string]: string }> {
    const variants = {
      thumbnail: { width: 150, height: 150, quality: 70 },
      small: { width: 400, quality: 75 },
      medium: { width: 800, quality: 80 },
      large: { width: 1200, quality: 85 },
      original: { quality: 90 }
    };

    const results: { [key: string]: string } = {};

    await fs.mkdir(outputDir, { recursive: true });

    for (const [variant, options] of Object.entries(variants)) {
      const outputPath = path.join(outputDir, `${basename}_${variant}.webp`);
      
      try {
        await this.optimizeImage(inputPath, outputPath, {
          ...options,
          format: 'webp'
        });
        results[variant] = outputPath;
      } catch (error) {
        // // console.error(`Failed to generate ${variant} variant:`, error);
      }
    }

    return results;
  }

  /**
   * Optimize images in a directory
   */
  static async optimizeDirectory(
    inputDir: string,
    outputDir: string,
    options: ImageOptimizationOptions = {}
  ): Promise<{ processed: number; totalSavings: number }> {
    let processed = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    try {
      await fs.mkdir(outputDir, { recursive: true });
      const files = await fs.readdir(inputDir);
      
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
      );

      for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, 
          file.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
        );

        try {
          const result = await this.optimizeImage(inputPath, outputPath, {
            ...options,
            format: 'webp'
          });
          
          totalOriginalSize += result.originalSize;
          totalOptimizedSize += result.optimizedSize;
          processed++;
        } catch (error) {
          // // console.error(`✗ Failed to optimize ${file}:`, error);
        }
      }

      const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;
      
      return {
        processed,
        totalSavings
      };
    } catch (error) {
      // // console.error('Directory optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get image metadata
   */
  static async getImageInfo(imagePath: string) {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await fs.stat(imagePath);
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      // // console.error('Failed to get image info:', error);
      throw error;
    }
  }
}