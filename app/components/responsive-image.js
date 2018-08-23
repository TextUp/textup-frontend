import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImageVersion } from 'textup-frontend/objects/media-image';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    versions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.instanceOf(MediaImageVersion),
        PropTypes.shape({
          source: PropTypes.string.isRequired,
          width: PropTypes.number
        })
      ])
    ),
    alt: PropTypes.string,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func
  },
  getDefaultProps() {
    return {
      versions: [],
      alt: this.get('constants.IMAGE.DEFAULT_ALT')
    };
  },

  tagName: 'img',
  attributeBindings: [
    '_sourceSet:srcset',
    '_sizes:sizes',
    '_fallbackSource:src',
    '_width:width',
    'alt'
  ],
  classNames: ['responsive-image'],

  didInsertElement() {
    this._super(...arguments);
    this.get('_$window').on(this.get('_windowEventName'), () => this._onWindowResize());
    this.get('_$img')
      .on(this.get('_loadEventName'), ev => this._onLoadSuccess(ev))
      .on(this.get('_errorEventName'), ev => this._onLoadFailure(ev));
    Ember.run.scheduleOnce('afterRender', this, this._updateSize);
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
  _sortedVersions: computed.sort('versions', '_sortVersionsBy'),
  _sourceSet: computed('_sortedVersions.@each.{source,width}', function() {
    const versions = this.get('_sortedVersions'),
      sources = [];
    versions.forEach(({ source, width }) => {
      if (width) {
        sources.pushObject(`${source} ${width}w`);
      }
    });
    return sources.join(',');
  }),
  _fallbackSource: computed('_sortedVersions.@each.{source,width}', function() {
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

  // Internal handlers
  // -----------------

  _onLoadSuccess(event) {
    tryInvoke(this, 'onSuccess', [event]);
  },
  _onLoadFailure(event) {
    tryInvoke(this, 'onFailure', [event]);
  },
  _onWindowResize() {
    Ember.run.debounce(this, this._updateSize, 250);
  },
  _updateSize() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this.set('_sizes', this._calculateUpdatedSize());
  },
  _calculateUpdatedSize() {
    const viewportWidthRatio = Math.round(
      Math.max(this.get('_$img').width() / this.get('_$window').width() * 100, 100)
    );
    return `${viewportWidthRatio}vw`;
  }
});
