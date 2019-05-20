import imageCompression from 'browser-image-compression';

// [UNTESTED] these are wrapped to allow for overriding during testing because we can't directly
// override the ES imported modules directly

export function startImageCompression(file, compressionFactor) {
  return imageCompression(file, compressionFactor);
}

export function getDataUrlFromFile(compressedFile) {
  return imageCompression.getDataUrlFromFile(compressedFile);
}

export function loadImage(data) {
  return imageCompression.loadImage(data);
}
