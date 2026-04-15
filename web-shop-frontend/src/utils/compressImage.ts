/** Компресия на снимка за по-бързо качване (напр. Render с ограничена памет). */
export function compressImage(file: File, maxSizeMB: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxDimension = 1280;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
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

        let quality = 0.85;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              if (blob.size <= maxSizeBytes || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                console.log(
                  `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(blob.size / 1024 / 1024).toFixed(2)}MB`
                );
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
