import Ember from 'ember';
import Location from 'textup-frontend/models/location';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { buildPreviewUrl } from 'textup-frontend/utils/location';

const { computed, tryInvoke, run, getWithDefault } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    location: PropTypes.instanceOf(Location).isRequired,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    loadingMessage: PropTypes.string,
    errorMessage: PropTypes.string
  },
  getDefaultProps() {
    return { loadingMessage: 'Loading', errorMessage: 'Could not load preview' };
  },
  classNames: ['location-preview'],

  didInsertElement() {
    this._super(...arguments);
    this.get('_$img')
      .on(this.get('_loadEventName'), this._onSuccess.bind(this))
      .on(this.get('_errorEventName'), this._onFailure.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    this.get('_$img')
      .off(this.get('_loadEventName'))
      .off(this.get('_errorEventName'));
  },
  click() {
    this.toggleProperty('_isShowingAddress');
  },

  // Internal properties
  // -------------------

  _previewAlt: computed('location.address', function() {
    return `Previewing location with address ${this.get('location.address')}`;
  }),
  _previewUrl: computed('location.latLng', function() {
    const { lat, lng } = this.get('location.latLng'),
      config = Ember.getOwner(this).resolveRegistration('config:environment');
    this._startLoadProps();
    return buildPreviewUrl(config, lat, lng, this._getLargestDimension(config));
  }),
  _isLoading: false,
  _isError: false,
  _isShowingAddress: false,
  _loadEventName: computed('elementId', function() {
    return `load.${this.get('elementId')}`;
  }),
  _errorEventName: computed('elementId', function() {
    return `error.${this.get('elementId')}`;
  }),
  _$img: computed(function() {
    return this.$('img');
  }),

  // Internal handlers
  // -----------------

  _onSuccess() {
    run(() => this._finishLoadProps(true));
    tryInvoke(this, 'onSuccess', [...arguments]);
  },
  _onFailure() {
    run(() => this._finishLoadProps(false));
    tryInvoke(this, 'onFailure', [...arguments]);
  },
  _startLoadProps() {
    this.setProperties({ _isLoading: true, _isError: false });
  },
  _finishLoadProps(isSuccess) {
    this.setProperties({ _isLoading: false, _isError: !isSuccess });
  },
  _getLargestDimension: function(config) {
    const { maxHeight, maxWidth } = config.locationPreview,
      // may be null if haven't rendered component yet
      clientHeight = getWithDefault(this, 'element.clientHeight', maxHeight),
      clientWidth = getWithDefault(this, 'element.clientWidth', maxWidth);
    return Math.max(Math.min(clientHeight, maxHeight), Math.min(clientWidth, maxWidth));
  }
});
