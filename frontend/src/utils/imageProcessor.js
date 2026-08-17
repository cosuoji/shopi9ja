/**
 * Automatically center-crops and compresses any image to the desired target aspect ratio.
 */
export const processStoreImage = (file, { targetAspect, maxDimension = 1920, quality = 0.82 }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let { width, height } = img;
        let cropX = 0;
        let cropY = 0;
        let cropWidth = width;
        let cropHeight = height;

        // 1. Calculate Center Crop Dimensions if targetAspect is specified
        if (targetAspect) {
          const currentAspect = width / height;

          if (currentAspect > targetAspect) {
            // Image is wider than target ratio -> crop left & right edges
            cropWidth = Math.round(height * targetAspect);
            cropX = Math.round((width - cropWidth) / 2);
          } else if (currentAspect < targetAspect) {
            // Image is taller than target ratio -> crop top & bottom edges
            cropHeight = Math.round(width / targetAspect);
            cropY = Math.round((height - cropHeight) / 2);
          }
        }

        // 2. Scale down if larger than maxDimension
        let outputWidth = cropWidth;
        let outputHeight = cropHeight;

        if (outputWidth > maxDimension || outputHeight > maxDimension) {
          if (outputWidth > outputHeight) {
            outputHeight = Math.round((outputHeight * maxDimension) / outputWidth);
            outputWidth = maxDimension;
          } else {
            outputWidth = Math.round((outputWidth * maxDimension) / outputHeight);
            outputHeight = maxDimension;
          }
        }

        // 3. Draw cropped portion onto Canvas
        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight, // Source crop area
          0, 0, outputWidth, outputHeight      // Canvas target destination
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Image processing failed'));
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(processedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Invalid image file'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};
