/**
 * Client-side image compression before upload — smaller payload = faster POST + Cloudinary.
 * Uses canvas; skips non-image or tiny files.
 */
const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;

export async function compressImageFile(file) {
  if (!file || !file.type.startsWith("image/")) return file;
  // Skip if already small
  if (file.size < 400 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_EDGE && height <= MAX_EDGE) {
        // Under cap — still re-encode JPEG to shrink file size a bit
        if (file.type === "image/jpeg" && file.size < 900 * 1024) {
          resolve(file);
          return;
        }
      }
      if (width > MAX_EDGE || height > MAX_EDGE) {
        const scale = Math.min(MAX_EDGE / width, MAX_EDGE / height, 1);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function compressImageFiles(files) {
  if (!files || !files.length) return files;
  return Promise.all(files.map((f) => compressImageFile(f)));
}
