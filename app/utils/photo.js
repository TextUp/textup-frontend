import Ember from 'ember';
import imageCompression from 'npm:browser-image-compression';
import { MediaImage } from 'textup-frontend/objects/media-image';

const { get, RSVP, isPresent, isArray, typeOf } = Ember;

// Uploading image
// ---------------

export function extractImagesFromEvent(event) {
  return new RSVP.Promise((resolve, reject) => {
    if (typeOf(event) !== 'object' || typeOf(event.target) !== 'object') {
      reject();
    }
    const files = _getFilesFromTarget(event.target),
      promises = [];
    if (!isPresent(files) || !isArray(files)) {
      reject();
    }

    files.forEach(file => {
      promises.pushObject(imageCompression(file, 0.5));
    });
    RSVP.Promise
      .all(promises)
      .then(compressedFiles => {
        return RSVP.Promise.all(compressedFiles.map(_formatCompressedImages));
      })
      .then(resolve)
      .catch(reject);
  });
}

function _getFilesFromTarget(target) {
  if (typeOf(target.files) === 'array') {
    return target.files;
  } else if (isPresent(target.value)) {
    return [target.value];
  } else {
    return [];
  }
}

function _formatCompressedImages(compressedFile) {
  return new RSVP.Promise((resolve, reject) => {
    const result = { mimeType: compressedFile.type };
    imageCompression
      .getDataUrlFromFile(compressedFile)
      .then(data => {
        result.data = data;
        return imageCompression.loadImage(data);
      })
      .then(img => {
        result.width = img.naturalWidth;
        result.height = img.naturalHeight;
        resolve(result);
      })
      .catch(reject);
  });
}

// Ensuring data completeness
// --------------------------

export function ensureImageDimensions(mediaImages) {
  return new RSVP.Promise((resolve, reject) => {
    if (typeOf(mediaImages) !== 'array' || !isPresent(mediaImages)) {
      reject(mediaImages);
    }
    const versionsFetchingDimensions = [];
    mediaImages.forEach(mediaImage => {
      const versions = get(mediaImage, 'versions');
      if (typeOf(mediaImages) === 'array') {
        versions.forEach(version => {
          if (!_hasDimensions(version)) {
            versionsFetchingDimensions.pushObject(_fetchVersionDimensions(version));
          }
        });
      }
    });
    return RSVP.Promise
      .all(versionsFetchingDimensions)
      .then(results => {
        results.forEach(({ version, dimensions }) => {
          if (_hasDimensions(dimensions)) {
            version.setProperties(dimensions);
          }
        });
        resolve(mediaImages);
      })
      .catch(reject);
  });
}

function _hasDimensions(obj) {
  return (
    (typeOf(obj) === 'object' || typeOf(obj) === 'instance') &&
    !isNaN(parseInt(get(obj, 'width'))) &&
    !isNaN(parseInt(get(obj, 'height')))
  );
}

function _fetchVersionDimensions(version) {
  return imageCompression.loadImage(version.get('source')).then(img => {
    return { dimensions: { width: img.naturalWidth, height: img.naturalHeight }, version };
  });
}

// Fetching image dimensions for gallery
// -------------------------------------

export function shouldRebuildResponsiveGallery(
  prevWidth,
  prevDensity,
  currentWidth,
  currentDensity
) {
  if (!prevWidth || !prevDensity || !currentWidth || !currentDensity) {
    return false;
  }
  return (
    _estimateDeviceFromWidth(prevWidth * prevDensity) !==
    _estimateDeviceFromWidth(currentWidth * currentDensity)
  );
}
// rough breakpoint between mobile/tablet is 480px, tablet/desktop is 1024px
// See https://responsivedesign.is/develop/browser-feature-support/media-queries-for-common-device-breakpoints/
function _estimateDeviceFromWidth(width) {
  if (width < 480) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Takes in a media image and then returns a single object with key `src`, `w`, and `h`
// See the the `gettingData` event in the PhotoSwipe docs
export function formatResponsiveMediaImageForGallery(viewportWidth, pixelDensity, mediaImage) {
  const width = parseInt(viewportWidth * pixelDensity);
  if (isNaN(width) || !(mediaImage instanceof MediaImage)) {
    return;
  }

  const result = { src: '', w: 0, h: 0 };
  let currentSmallestDifference = Number.POSITIVE_INFINITY;
  mediaImage.get('versions').forEach(({ source, width: versionWidth, height }) => {
    const thisDifference = Math.abs(versionWidth - width);
    if (thisDifference < currentSmallestDifference) {
      result.src = source;
      result.w = versionWidth;
      result.h = height;
      currentSmallestDifference = thisDifference;
    }
  });
  return result;
}

export function getPreviewBounds(previewEl) {
  if (typeOf(previewEl) === 'object' && typeOf(previewEl.getBoundingClientRect) === 'function') {
    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
      bounds = previewEl.getBoundingClientRect(); // relative to viewport
    return {
      x: bounds.left,
      y: bounds.top + pageYScroll,
      w: bounds.width
    };
  }
}
