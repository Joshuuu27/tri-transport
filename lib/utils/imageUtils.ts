/**
 * Convert file to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before converting to base64
 * @param file - Image file to compress
 * @param maxWidth - Maximum width in pixels (default 1200)
 * @param maxHeight - Maximum height in pixels (default 1200)
 * @param quality - JPEG quality 0-1 (default 0.7)
 */
export async function compressAndEncodeImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const base64 = canvas.toDataURL("image/jpeg", quality);
          resolve(base64);
        };

        img.onerror = () => {
          reject(new Error("Could not load image"));
        };

        img.src = event.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get file size in MB
 */
export function getFileSizeInMB(file: File): number {
  return file.size / (1024 * 1024);
}
