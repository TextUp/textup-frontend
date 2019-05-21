import imageCompression from 'browser-image-compression';

// [UNTESTED] these are wrapped to allow for overriding during testing because we can't directly
// override the ES imported modules directly

export function startImageCompression(file, maxSizeMB = 0.5) {
  return imageCompression(file, { maxSizeMB });
}

export function getDataUrlFromFile(compressedFile) {
  return imageCompression.getDataUrlFromFile(compressedFile);
}

export function loadImage(dataString) {
  return imageCompression.loadImage(dataString);
}
