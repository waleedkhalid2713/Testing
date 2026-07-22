const MAX_IMAGE_BYTES = 450 * 1024;
const MAX_IMAGE_SIDE = 1280;

export async function compressForecastImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const source = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(source.width, source.height));
  let width = Math.max(1, Math.round(source.width * scale));
  let height = Math.max(1, Math.round(source.height * scale));
  let quality = 0.78;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Your browser cannot prepare this image.");
    }

    context.drawImage(source, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );

    if (!blob) {
      throw new Error("Unable to compress this image.");
    }

    if (blob.size <= MAX_IMAGE_BYTES || attempt === 6) {
      if (blob.size > MAX_IMAGE_BYTES) {
        throw new Error("This image is still too large after compression. Please use a smaller screenshot.");
      }

      return new File([blob], `${file.name.replace(/\\.[^/.]+$/, "") || "forecast"}.jpg`, {
        type: "image/jpeg",
      });
    }

    quality = Math.max(0.4, quality - 0.1);
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
  }

  throw new Error("Unable to compress this image.");
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.readAsDataURL(file);
  });
}
