import { sort } from '@ember/object/computed';
import Component from '@ember/component';
import { isNone, tryInvoke } from '@ember/utils';
import { run, scheduleOnce, debounce } from '@ember/runloop';
import { get, computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import MediaElementVersion from 'textup-frontend/models/media-element-version';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    versions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.instanceOf(MediaElementVersion),
        PropTypes.shape({ source: PropTypes.string.isRequired, width: PropTypes.number }),
      ])
    ),
    alt: PropTypes.string,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
  },
  getDefaultProps() {
    return { versions: [], alt: Constants.IMAGE.DEFAULT_ALT };
  },

  tagName: 'img',
  attributeBindings: [
    '_sourceSet:srcset',
    '_sizes:sizes',
    '_fallbackSource:src',
    '_width:width',
    'alt',
  ],
  classNames: ['responsive-image'],
  classNameBindings: ['_isLoadingSuccess:responsive-image--success'],

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('_isLoading', true);
  },
  didInsertElement() {
    this._super(...arguments);
    this.get('_$window').on(this.get('_windowEventName'), () => this._onWindowResize());
    this.get('_$img')
      .on(this.get('_loadEventName'), ev => this._onLoadSuccess(ev))
      .on(this.get('_errorEventName'), ev => this._onLoadFailure(ev));
    scheduleOnce('afterRender', this, this._updateSize);
  },
  willDestroyElement() {
    this._super(...arguments);
    this.get('_$window').off(this.get('_windowEventName'));
    this.get('_$img')
      .off(this.get('_loadEventName'))
      .off(this.get('_errorEventName'));
  },

  // Internal properties
  // -------------------

  _sortVersionsBy: ['width'],
  _sortedVersions: sort('versions', '_sortVersionsBy'),
  _sourceSet: computed('_sizes', '_sortedVersions.@each.{source,width}', function() {
    if (isNone(this.get('_sizes'))) {
      return;
    }
    const versions = this.get('_sortedVersions'),
      sources = [];
    versions.forEach(version => {
      const source = get(version, 'source'),
        width = get(version, 'width');
      if (width) {
        sources.pushObject(`${source} ${width}w`);
      }
    });
    return sources.join(',');
  }),
  _fallbackSource: computed('_sizes', '_sortedVersions.@each.{source,width}', function() {
    if (isNone(this.get('_sizes'))) {
      return;
    }
    const versions = this.get('_sortedVersions');
    let source = '';
    if (versions.get('firstObject.source')) {
      source = versions.get('firstObject.source');
    } else if (versions.get('lastObject.source')) {
      source = versions.get('lastObject.source');
    }
    return source;
  }),
  // specify width attribute to be the largest possible to prevent oversizing images
  // see https://medium.com/@MRWwebDesign/responsive-images-the-sizes-attribute-and-unexpected-image-sizes-882a2eadb6db
  _width: computed('_sortedVersions.@each.{source,width}', function() {
    const versions = this.get('_sortedVersions'),
      maxWidth = versions.get('lastObject.width');
    return maxWidth ? maxWidth : null;
  }),
  _sizes: null,
  _windowEventName: computed('elementId', function() {
    return `resize.${this.get('elementId')}`;
  }),
  _loadEventName: computed('elementId', function() {
    return `load.${this.get('elementId')}`;
  }),
  _errorEventName: computed('elementId', function() {
    return `error.${this.get('elementId')}`;
  }),
  _$img: computed('elementId', function() {
    return this.$();
  }),
  _$window: computed(function() {
    return this.$(window);
  }),
  _isLoading: false,
  _isSuccess: false,
  _isLoadingSuccess: computed('_isLoading', '_isSuccess', function() {
    return !this.get('_isLoading') && this.get('_isSuccess');
  }),

  // Internal handlers
  // -----------------

  _onLoadSuccess(event) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run(() => this.setProperties({ _isSuccess: true, _isLoading: false }));
    tryInvoke(this, 'onSuccess', [event]);
  },
  _onLoadFailure(event) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run(() => this.setProperties({ _isSuccess: false, _isLoading: false }));
    tryInvoke(this, 'onFailure', [event]);
  },
  _onWindowResize() {
    debounce(this, this._updateSize, 250);
  },
  _updateSize() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_sizes', this._calculateUpdatedSize());
  },
  _calculateUpdatedSize() {
    const viewportWidthRatio = Math.round(
      Math.min((this.get('_$img').width() / this.get('_$window').width()) * 100, 100)
    );
    // don't want to return `0vw` because that effectively hides the image completely
    return viewportWidthRatio !== 0 ? `${viewportWidthRatio}vw` : '1vw';
  },
});
