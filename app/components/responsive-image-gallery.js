/* global PhotoSwipe */
/* global PhotoSwipeUI_Default */

import Ember from 'ember';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';
import PhotoSwipeComponent from 'ember-photoswipe/components/photo-swipe';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImage } from 'textup-frontend/objects/media-image';
import {
  getPreviewBounds,
  shouldRebuildResponsiveGallery,
  formatResponsiveMediaImageForGallery
} from 'textup-frontend/utils/photo';

const { computed, isPresent, tryInvoke } = Ember;

export default PhotoSwipeComponent.extend(PropTypesMixin, HasWormhole, {
  propTypes: {
    images: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.arrayOf(PropTypes.instanceOf(MediaImage))
    ]),
    thumbnailClass: PropTypes.string // for thumbnail coordinates function
  },
  getDefaultProps() {
    return { images: [], thumbnailClass: '' };
  },

  // Use superclass template. See https://stackoverflow.com/a/27450643
  layoutName: 'ember-photoswipe/components/photo-swipe',

  // Overrides
  // ---------

  showHideOpacity: true,
  history: false,
  captionEl: false,
  shareEl: false,
  bgOpacity: 0.85,
  getThumbBoundsFn: computed('_getThumbBoundsFn', function() {
    return this.get('_getThumbBoundsFn').bind(this);
  }),

  open(actionOptions) {
    const images = this.get('images');
    if (!isPresent(images)) {
      return;
    }
    const pswpElement = this.get('_elementToWormhole'),
      options = this.get('options'),
      assignedOptions = Ember.assign({}, options, actionOptions),
      pswp = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, images, assignedOptions);
    this.set('pswp', pswp);
    this._resetResizeProps();

    // need to override event listeners binding because event properties aren't
    // being passed to the listeners properly AND these events for responsive image selection
    // need to be bound BEFORE init is called
    pswp.listen('gettingData', this.get('_onGettingData').bind(this));
    pswp.listen('beforeResize', this.get('_onBeforeResize').bind(this));
    pswp.init();
  },

  // Internal properties
  // -------------------

  _elementToWormhole: computed(function() {
    return this.get('element').querySelector('.pswp');
  }),
  _getThumbBoundsFn: function(index) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const thumbnailClass = this.get('thumbnailClass');
    if (isPresent(thumbnailClass)) {
      const displayedItem = this.$(`.${thumbnailClass}`).get(index);
      if (displayedItem) {
        return getPreviewBounds(displayedItem);
      }
    }
  },
  _isFirstResize: true, // perhaps prevents infinite loop of resizing <-> rebuilding
  _prevResizeWidth: null,
  _prevResizeDensity: null,

  // Internal handlers
  // -----------------

  _onBeforeResize: function() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const viewportWidth = this.get('pswp.viewportSize.x'),
      pixelDensity = window.devicePixelRatio;
    if (this.get('_isFirstResize')) {
      this._updateResizeProps(viewportWidth, pixelDensity);
    } else {
      const prevWidth = this.get('_prevResizeWidth'),
        prevDensity = this.get('_prevResizeDensity');
      if (shouldRebuildResponsiveGallery(prevWidth, prevDensity, viewportWidth, pixelDensity)) {
        tryInvoke(this.get('pswp'), 'invalidateCurrItems');
        this._updateResizeProps(viewportWidth, pixelDensity);
      }
    }
  },
  _resetResizeProps() {
    this.setProperties({ _isFirstResize: true, _prevResizeWidth: null, _prevResizeDensity: null });
  },
  _updateResizeProps(viewportWidth, pixelDensity) {
    this.setProperties({
      _isFirstResize: false,
      _prevResizeWidth: viewportWidth,
      _prevResizeDensity: pixelDensity
    });
  },

  _onGettingData: function(index, item) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const viewportWidth = this.get('pswp.viewportSize.x'),
      pixelDensity = window.devicePixelRatio,
      mediaImage = this.get('images').objectAt(index),
      result = formatResponsiveMediaImageForGallery(viewportWidth, pixelDensity, mediaImage);
    if (result) {
      Ember.merge(item, result);
    }
  }
});
