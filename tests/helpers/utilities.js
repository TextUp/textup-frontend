import { MediaImage, API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';

export const VALID_IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKBAMAAAB/HNKOAAAAGFBMVEXMzMyWlpajo6O3t7fFxcWcnJyxsbG+vr50Rsl6AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJklEQVQImWNgwADKDAwsAQyuDAzMAgyMbOYMAgyuLApAUhnMRgIANvcCBwsFJwYAAAAASUVORK5CYII=';

export function mockInvalidMediaImage() {
  const mediaImage = MediaImage.create({ [API_ID_PROP_NAME]: `${Math.random()}` });
  mediaImage.addVersion('not', 350, 88);
  mediaImage.addVersion('valid', 100, 88);
  mediaImage.addVersion('link', 50, 88);

  return mediaImage;
}

export function mockValidMediaImage() {
  const mediaImage = MediaImage.create({
    [API_ID_PROP_NAME]: `${Math.random()}`,
    mimeType: Math.random()
  });
  mediaImage.addVersion('https://via.placeholder.com/350x150', 350, 88);
  mediaImage.addVersion('https://via.placeholder.com/100x150', 100, 88);
  mediaImage.addVersion('https://via.placeholder.com/50x150', 50, 88);

  return mediaImage;
}

/* jshint ignore:start */
export function mockModel(id, modelName, otherProps) {
  return Ember.Object.create({ id, constructor: { modelName }, ...otherProps });
}
/* jshint ignore:end */
