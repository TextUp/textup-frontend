import Ember from 'ember';
import Location from 'textup-frontend/models/location';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { buildPreviewUrl } from 'textup-frontend/utils/location';

const { computed, tryInvoke, run, typeOf, getWithDefault } = Ember;

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
  classNameBindings: [
    '_isShowingAddress:location-preview--overlay',
    '_isLoading:location-preview--overlay',
    '_isError:location-preview--overlay'
  ],

  didInsertElement() {
    this._super(...arguments);
    // wait until after render so that client height and width will not be null
    run.scheduleOnce('afterRender', () => {
      if (this.get('isDestroying') || this.get('isDestroyed')) {
        return;
      }
      this.set('_shouldLoad', true);
    });
  },

  click() {
    if (this.get('location.address')) {
      this.toggleProperty('_isShowingAddress');
    } else {
      this.set('_isShowingAddress', false);
    }
  },

  // Internal properties
  // -------------------

  _previewAlt: computed('location.address', function() {
    return `Previewing location with address ${this.get('location.address')}`;
  }),
  _previewUrl: computed('location.latLng.{lat,lng}', function() {
    const latLng = this.get('location.latLng');
    if (typeOf(latLng) !== 'object' || !latLng.lat || !latLng.lng) {
      return;
    }
    const { lat, lng } = latLng,
      config = Ember.getOwner(this).resolveRegistration('config:environment');
    // schedule this method call so we don't try to modify classes multiple times in a single render
    run.scheduleOnce('actions', this._startLoadProps.bind(this));
    return [{ source: buildPreviewUrl(config, lat, lng, this._getLargestDimension(config)) }];
  }),
  _shouldLoad: false,
  _isLoading: false,
  _isError: false,
  _isShowingAddress: false,

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
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.setProperties({ _isLoading: true, _isError: false });
  },
  _finishLoadProps(isSuccess) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
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
