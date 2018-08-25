import Ember from 'ember';

const { isNone, getWithDefault } = Ember;

export function buildPreviewUrl(config, lat, lng, size) {
  if (isNone(config)) {
    return;
  }
  const url = getWithDefault(config, 'locationPreview.host', ''),
    token = getWithDefault(config, 'apiKeys.mapbox', ''),
    marker = 'pin-m',
    coord = `${lng},${lat}`,
    zoom = 15;
  return `${url}/${marker}(${coord})/${coord},${zoom}/${size}x${size}.png?access_token=${token}`;
}
