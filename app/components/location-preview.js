import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import config from '../config/environment';
import InViewportMixin from 'ember-in-viewport';
import {
    toHexString
} from '../utils/color';

const {
    computed,
    run
} = Ember, {
    min,
    max
} = Math;

export default Ember.Component.extend(InViewportMixin, {

    location: null, // must be object with keys 'lat' and 'lng'
    zoom: defaultIfAbsent(15), // must be an integer
    markerSize: defaultIfAbsent("medium"), // one of small, medium or large
    markerColor: defaultIfAbsent("#3399cc"), // 3 or 6 digit hex color

    loadingMessage: defaultIfAbsent(""),
    errorMessage: defaultIfAbsent("Map could not be loaded"),
    delayThreshold: defaultIfAbsent(300),
    deferred: defaultIfAbsent(true), // default loading until enters viewport

    classNames: 'location-preview',

    // Internal properties
    // -------------------

    _isLoading: true,
    _hasError: false,

    // Computed properties
    // -------------------

    _isError: computed('_isLocationValid', '_hasError', function() {
        return !this.get('_isLocationValid') || this.get('_hasError');
    }),
    $img: computed(function() {
        return this.$().find('img');
    }),
    _isLocationValid: computed('location.{lat,lng}', function() {
        const loc = this.get('location');
        return loc && !isNaN(parseFloat(loc.lat)) && !isNaN(parseFloat(loc.lng));
    }),
    _coordinateString: computed('_isLocationValid', 'location.{lat,lng}', function() {
        const valid = this.get('_isLocationValid'),
            loc = this.get('location');
        return valid ? `${loc.lng},${loc.lat}` : null;
    }),
    _marker: computed('markerSize', function() {
        switch (this.get('markerSize')) {
            case 'small':
                return 'pin-s';
            case 'medium':
                return 'pin-m';
            case 'large':
                return 'pin-l';
            default:
                return 'pin-m';
        }
    }),
    _color: computed('markerColor', function() {
        return toHexString(this.get('markerColor'));
    }),
    _markerString: computed('_color', '_marker', '_coordinateString', function() {
        const color = this.get('_color'),
            mark = this.get('_marker'),
            coord = this.get('_coordinateString');
        if (color) {
            return `${mark}+${color.replace('#', '')}(${coord})`;
        } else {
            return `${mark}(${coord})`;
        }
    }),

    // Events
    // ------

    didInsertElement: function() {
        this._super(...arguments);

        const shouldWait = this.get('deferred');
        // from ember-in-viewport
        this.set('viewportEnabled', shouldWait);
        // if should not wait, then load preview immediately
        if (!shouldWait) {
            this.startPreview();
        }
    },
    willDestroyElement: function() {
        this._super(...arguments);
        this.stopPreview();
    },
    didEnterViewport: function() {
        this.startPreview();
    },

    // Methods
    // -------

    startPreview: function() {
        this._loadPreview();
        this.addObserver('location.{lat,lng}', this, this._rebuildOnLocationChange);
    },
    stopPreview: function() {
        this.get('$img').off(`.${this.elementId}`);
        this.removeObserver('location.{lat,lng}', this, this._rebuildOnLocationChange);
    },
    _rebuildOnLocationChange: function() {
        run.debounce(this, this._loadPreview, this.get('delayThreshold'));
    },

    // Helpers
    // -------

    _loadPreview: function() {
        // short circuit if the location is invalid
        if (!this.get('_isLocationValid')) {
            return;
        }
        // remove previous event handlers to avoid re-rendering
        // preview multiple times if we happen to change the
        // location multiple times
        const elId = this.elementId,
            largestDim = this._getLargestDimension();
        // sometimes when the preview is in the process of being hidden
        // the viewport hook can be triggered. In these cases, the largest
        // dimension will turn out to be 0. We don't want to load the preview
        // when this happens.
        if (largestDim > 0) {
            this.get('$img').off(`load.${elId} error.${elId}`);
            this.set('_isLoading', true);
            this._doRequest(largestDim).then(() => {
                this.set('_isLoading', false);
                this.set('_hasError', false);
            }, () => {
                this.set('_isLoading', false);
                this.set('_hasError', true);
            });
        }
    },
    _doRequest: function(size) {
        const request = this._buildRequest(size),
            elId = this.elementId;
        return new Ember.RSVP.Promise((resolve, reject) => {
            this.get('$img')
                .one(`load.${elId}`, resolve)
                .one(`error.${elId}`, reject)
                .attr('src', request);
        });
    },
    _getLargestDimension: function() {
        const el = this.element,
            {
                maxHeight,
                maxWidth
            } = config.locationPreview;
        return max(min(el.clientHeight, maxHeight), min(el.clientWidth, maxWidth));
    },
    _buildRequest: function(size) {
        const url = config.locationPreview.host,
            mark = this.get('_markerString'),
            coord = this.get('_coordinateString'),
            zoom = this.get('zoom'),
            token = config.apiKeys.mapbox;
        return `${url}/${mark}/${coord},${zoom}/${size}x${size}.png?access_token=${token}`;
    },
});