import config from 'textup-frontend/config/environment';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';
import Ember from 'ember';

const { computed, run } = Ember;

export default Ember.Component.extend({
  location: null, // must be object with keys 'lat' and 'lng'
  description: null, // human readable description of location
  searchPlaceholder: defaultIfAbsent('Search for location...'),
  throttle: defaultIfAbsent(500),
  selectZoomLevel: defaultIfAbsent(16),
  timeout: defaultIfAbsent(250), // in milliseconds

  // passed latLng (as LatLng object), description string, and raw geoJson
  // returns Promise, resolve indicating component should update based
  // on the values of location and description
  // mutates passed-in location and description
  onSelect: null,
  // passed nothing
  // returns Promise, resolve indicating component should update based
  // on the values of location and description
  // mutates passed-in location and description
  onDeselect: null,
  // passed error json
  // returns nothing
  onError: null,

  classNames: 'location-control',
  popupClass: defaultIfAbsent('location-control-popup'),
  activeClass: defaultIfAbsent('active'),

  _results: defaultIfAbsent([]),
  _isEditing: computed(function() {
    return !this._hasLatLng();
  }),

  _map: null,
  _features: null,
  _geocoder: null,

  // Computed properties
  // -------------------

  $map: Ember.computed(function() {
    return this.$('.location-map');
  }),
  mapId: Ember.computed(function() {
    return `${this.elementId}--map`;
  }),

  // Events
  // ------

  didInsertElement() {
    run.scheduleOnce('afterRender', this._setupMapbox.bind(this));
  },
  willDestroyElement() {
    const map = this.get('_map');
    if (map) {
      map.off();
    }
    this.$().off(`.${this.elementId}`);
  },
  _setupMapbox() {
    // set access token
    window.L.mapbox.accessToken = config.apiKeys.mapbox;
    // mapbox.streets is a map on mapbox.com
    const map = window.L.mapbox.map(this.get('mapId'), 'mapbox.streets'),
      // create an empty feature layer
      featureLayer = window.L.mapbox.featureLayer(),
      geocoder = window.L.mapbox.geocoder('mapbox.places');
    // set properties
    featureLayer.addTo(map);
    this.setProperties({ _map: map, _features: featureLayer, _geocoder: geocoder });
    // bind events
    map
      .on('popupopen', this.centerAfterOpen.bind(this))
      .on(
        'resize',
        function() {
          Ember.run.scheduleOnce('afterRender', this, function() {
            map.invalidateSize(true);
          });
        }.bind(this)
      )
      .on(
        'locationfound',
        function(event) {
          this.set('_location', event.latlng);
          geocoder.reverseQuery(event.latlng, this.processResultsAndSelectFirst.bind(this));
        }.bind(this)
      );
    this.$().on(
      `click.${this.elementId}`,
      `.${this.get('popupClass')} button`,
      this.deselectResult.bind(this)
    );
    // only geolocate if location is not already provided
    if (this._hasLatLng()) {
      this.refreshPopup();
    } else {
      map.locate({ setView: true });
    }
  },

  // Searching
  // ---------

  _doSearch(event) {
    // so that the page is not accidentally refreshed
    event.stopPropagation();
    event.preventDefault();
    const query = Ember.$(event.target)
      .find('input')
      .val();
    if (!query) {
      return;
    }
    run.throttle(
      this,
      function() {
        this.get('_geocoder').query(
          { query, proximity: this.get('_location') },
          this.processResults.bind(this)
        );
      },
      this.get('throttle'),
      true
    );
  },

  // Search results
  // --------------

  clearResults() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const featureLayer = this.get('_features');
    this.set('_results', []);
    featureLayer.setGeoJSON([]);
  },
  processResultsAndSelectFirst(error, data) {
    this.processResults(error, data);
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.selectResult(this.get('_results.firstObject'));
    });
  },
  processResults(error, data) {
    if (Ember.isPresent(error)) {
      Ember.tryInvoke(this, 'onError', [error]);
      return;
    }
    const map = this.get('_map'),
      featureLayer = this.get('_features');
    // clear current results
    map.closePopup();
    this.clearResults();
    const features = Ember.A(data.features || data.results.features).filter(function(feature) {
      return Ember.isPresent(feature.properties.address || feature.place_name);
    });
    featureLayer.setGeoJSON({ type: 'FeatureCollection', features });
    this.set('_results', featureLayer.getLayers());
    // display results on map
    if (data.lbounds) {
      map.fitBounds(data.lbounds);
    } else if (data.latlng) {
      map.setView(data.latlng, this.get('selectZoomLevel'));
    } else if (Ember.isPresent(features)) {
      map.fitBounds(featureLayer.getBounds());
    }
    // bind select event handlers
    featureLayer.eachLayer(layer => layer.on('click', this.selectResult.bind(this, layer)));
  },
  selectResult(layer) {
    if (!Ember.isPresent(layer)) {
      return;
    }
    var results = this.get('_results'),
      latLng = layer.getLatLng();
    // update which result layer is active
    results.forEach(layer => Ember.set(layer, 'status', ''));
    this.set('_location', latLng);
    Ember.set(layer, 'status', this.get('activeClass'));
    Ember.run.scheduleOnce('afterRender', this, function() {
      const geoJson = layer.feature,
        desc = geoJson.properties.address || geoJson.place_name,
        result = Ember.tryInvoke(this, 'onSelect', [latLng, desc, geoJson]),
        after = this.refreshPopup.bind(this);
      if (result && result.then) {
        // is promise
        result.then(after);
      } else {
        Ember.run.later(this, after, this.get('timeout'));
      }
    });
  },
  deselectResult() {
    var results = this.get('_results');
    // update which result layer is active
    results.forEach(layer => Ember.set(layer, 'status', ''));
    const result = Ember.tryInvoke(this, 'onDeselect'),
      after = this.refreshPopup.bind(this);
    if (result && result.then) {
      // is promise
      result.then(after);
    } else {
      Ember.run.later(this, after, this.get('timeout'));
    }
  },

  // Popups
  // ------

  refreshPopup() {
    // run next to give bindings time to synchronize
    Ember.run.next(this, this._doRefresh);
  },
  _doRefresh() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const map = this.get('_map');
    if (this._hasLatLng()) {
      // open popup if location is present
      const latLng = this.get('location'),
        desc = this.get('description'),
        display = desc || JSON.stringify(latLng);
      map.openPopup(this._buildPopupString(display), latLng, {
        keepInView: true,
        closeButton: false,
        closeOnClick: false,
        className: this.get('popupClass'),
      });
      this.set('_isEditing', false);
    } else {
      // otherwise, close popup
      map.closePopup();
      this.set('_isEditing', true);
    }
  },
  _buildPopupString(description) {
    return `
      <h5>You\'ve selected this location!</h5>
      <p>${description}</p>
      <button>This isn't me</button>
    `;
  },
  centerAfterOpen(event) {
    const latLng = event.popup.getLatLng(),
      $popup = this.$(`.${this.get('popupClass')}`);
    if ($popup.length) {
      const popupHeight = $popup.height(),
        mapHeight = this.$().height(),
        smaller = Math.min(popupHeight / 2, mapHeight / 2);
      this.get('_map')
        .setZoom(this.get('selectZoomLevel'))
        .panTo(latLng)
        .panBy([0, -smaller]);
    }
  },

  _hasLatLng() {
    const latLng = this.get('location');
    return Ember.typeOf(latLng) === 'object' && latLng.lat && latLng.lng;
  },
});
