import { getWithDefault } from '@ember/object';
import config from 'textup-frontend/config/environment';

export function buildPreviewUrl(lat, lng, size) {
  const url = getWithDefault(config, 'locationPreview.host', ''),
    token = getWithDefault(config, 'apiKeys.mapbox', ''),
    marker = 'pin-m',
    coord = `${lng},${lat}`,
    zoom = 15;
  return `${url}/${marker}(${coord})/${coord},${zoom}/${size}x${size}.png?access_token=${token}`;
}
