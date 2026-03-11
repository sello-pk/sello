/**
 * Client-side image compression + aspect normalization before upload.
 * - Resize long edge to MAX_EDGE
 * - Center-crop to 4:3 so listing grids can use object-cover without
 *   portrait letterboxing or inconsistent landscape crops.
 */
const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;
/**
 * Center-crop canvas to target aspect (w/h). Returns new canvas.
 */
function centerCropToAspect(canvas, aspectW, aspectH) {
  const w = canvas.width;
  const h = canvas.height;
  const imgAspect = w / h;
  const targetAspect = aspectW / aspectH;
  let sx = 0,
    sy = 0,
    sw = w,
    sh = h;

  if (imgAspect > targetAspect) {
    // Image wider than target — crop left/right
    sw = Math.round(h * targetAspect);
    sx = Math.round((w - sw) / 2);
  } else if (imgAspect < targetAspect) {
    // Image taller than target — crop top/bottom
    sh = Math.round(w / targetAspect);
    sy = Math.round((h - sh) / 2);
  }

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return out;
}

export async function compressImageFile(file) {
  if (!file || !file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

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

      // Normalize to 4:3 so listing cards look consistent (no gray bars, no random crops)
      const cropped = centerCropToAspect(canvas, 4, 3);

      cropped.toBlob(
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
