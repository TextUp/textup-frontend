import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import callIfPresent from '../utils/call-if-present';
import config from '../config/environment';

export default Ember.Component.extend({

	location: null, // must be object with keys 'lat' and 'lng'
	description: null, // human readable description of location
	hideSidebar: defaultIfAbsent(false),
	startSidebarOpen: defaultIfAbsent(false),
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
	classNameBindings: [
		'_addClosedClass:closed',
		'_isEditing::sidebar-hidden',
		'hideSidebar:sidebar-hidden'
	],

	_searchTerm: null,
	_results: defaultIfAbsent([]),
	_isEditing: true,

	_map: null,
	_features: null,
	_geocoder: null,
	_addClosedClass: Ember.computed.not('startSidebarOpen'),
	_isOpen: Ember.computed.oneWay('startSidebarOpen'),

	// Computed properties
	// -------------------

	publicAPI: Ember.computed('_isOpen', function() {
		return {
			isOpen: this.get('_isOpen'),
			actions: {
				openSidebar: this.openSidebar.bind(this),
				closeSidebar: this.closeSidebar.bind(this)
			}
		};
	}),
	$sidebar: Ember.computed(function() {
		return this.$('.location-sidebar');
	}),
	$map: Ember.computed(function() {
		return this.$('.location-map');
	}),
	mapId: Ember.computed(function() {
		return `${this.elementId}--map`;
	}),

	// Events
	// ------

	didInsertElement: function() {
		window.L.mapbox.accessToken = config.apiKeys.mapbox;
		// initialize to specified starting state
		// fill in with map after done rendering
		const callback = function() {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.set('_isEditing', Ember.isPresent(this.get('location')));
			this._setupMapbox();
		}.bind(this);
		if (this.get('startSidebarOpen') && !this.get('hideSidebar')) {
			this.openSidebar(callback);
		} else {
			this.closeSidebar(callback);
		}
	},
	willDestroyElement: function() {
		const map = this.get('_map');
		if (map) {
			map.off();
		}
		this.$().off(`.${this.elementId}`);
		this._stopObserveChanges();
	},
	_setupMapbox: function() {
		// mapbox.streets is a map on mapbox.com
		const map = window.L.mapbox.map(this.get('mapId'), 'mapbox.streets'),
			// create an empty feature layer
			featureLayer = window.L.mapbox.featureLayer(),
			geocoder = window.L.mapbox.geocoder('mapbox.places');
		// set properties
		featureLayer.addTo(map);
		this.setProperties({
			_map: map,
			_features: featureLayer,
			_geocoder: geocoder
		});
		// bind events
		map
			.on('popupopen', this.centerAfterOpen.bind(this))
			.on('resize', function() {
				Ember.run.scheduleOnce('afterRender', this, function() {
					map.invalidateSize(true);
				});
			}.bind(this))
			.on('locationfound', function(event) {
				this.set('_location', event.latlng);
				geocoder.reverseQuery(event.latlng,
					this.processResultsAndSelectFirst.bind(this));
			}.bind(this));
		this.$().on(`click.${this.elementId}`, `.${this.get('popupClass')} button`,
			this.deselectResult.bind(this));
		// only geolocate if location is not already provided
		if (Ember.isPresent(this.get('location'))) {
			this.refreshPopup();
		} else {
			map.locate({
				setView: true,
			});
		}
	},

	// Actions
	// -------

	actions: {
		startEditing: function() {
			this.set('_isEditing', true);
		},
		toggleSidebar: function() {
			if (this.get('_isOpen')) {
				this.closeSidebar();
			} else {
				this.openSidebar();
			}
		},
		doSearch: function() {
			Ember.run.throttle(this, function() {
				this.get('_geocoder').query({
					query: this.get('_searchTerm'),
					proximity: this.get('_location')
				}, this.processResults.bind(this));
			}, this.get('throttle'), true);
		},
		selectResult: function(result) {
			this.selectResult(result);
		},
	},

	// Open/close sidebar
	// ------------------

	openSidebar: function(callback) {
		if (this.get('hideSidebar')) {
			return;
		}
		const $sidebar = this.get('$sidebar'),
			$map = this.get('$map'),
			map = this.get('_map');
		this._stopObserveChanges();
		$sidebar.animate({
			left: 0
		}, function() {
			this.set('_isOpen', true);
			this.set('_addClosedClass', false);
			// animate the map back to it's shrunken state
			// when the sidebar opens, and then invalidating
			// the size after the css is done rendering
			const delaySeconds = 0.5;
			$map.css({
				transition: `all ${delaySeconds}s`,
				left: '',
				width: ''
			});
			Ember.run.later(this, function() {
				if (map) {
					map.invalidateSize(true);
				}
				callIfPresent(callback);
			}, delaySeconds * 1000);
		}.bind(this));
	},
	closeSidebar: function(callback) {
		const $sidebar = this.get('$sidebar'),
			$map = this.get('$map'),
			$contents = $sidebar.find('.sidebar-contents'),
			width = $contents.width(),
			map = this.get('_map');
		this.set('_addClosedClass', true);
		$map
			.css('transition', '')
			.animate({
				left: 0,
				width: '100%'
			}, function() {
				if (map) {
					map.invalidateSize(true);
				}
				callIfPresent(callback);
			});
		$sidebar.animate({
			left: -width
		}, function() {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.set('_isOpen', false);
			this._startObserveChanges(function() {
				$sidebar.css('left', -$contents.width());
			});
		}.bind(this));
	},
	_startObserveChanges: function(doReposition) {
		Ember.$(window).on(`resize.${this.elementId}`, doReposition)
			.on(`orientationchange.${this.elementId}`, doReposition);
	},
	_stopObserveChanges: function() {
		Ember.$(window).off(`.${this.elementId}`);
	},

	// Search results
	// --------------

	clearResults: function() {
		const featureLayer = this.get('_features');
		this.set('_results', []);
		featureLayer.setGeoJSON([]);
	},
	processResultsAndSelectFirst: function(error, data) {
		this.processResults(error, data);
		Ember.run.scheduleOnce('afterRender', this, function() {
			this.selectResult(this.get('_results.firstObject'));
		});
	},
	processResults: function(error, data) {
		if (Ember.isPresent(error)) {
			callIfPresent(this.get('onError'), error);
			return;
		}
		const map = this.get('_map'),
			featureLayer = this.get('_features');
		// clear current results
		map.closePopup();
		this.clearResults();
		const features = Ember.A(data.features || data.results.features)
			.filter(function(feature) {
				return Ember.isPresent(feature.properties.address || feature.place_name);
			});
		featureLayer.setGeoJSON({
			type: 'FeatureCollection',
			features: features
		});
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
		featureLayer.eachLayer(function(layer) {
			layer.on('click', this.selectResult.bind(this, layer));
		}.bind(this));
	},
	selectResult: function(layer) {
		if (!Ember.isPresent(layer)) {
			return;
		}
		var results = this.get('_results'),
			latLng = layer.getLatLng();
		// update which result layer is active
		results.forEach(function(layer) {
			Ember.set(layer, 'status', '');
		});
		this.set('_location', latLng);
		Ember.set(layer, 'status', this.get('activeClass'));
		Ember.run.scheduleOnce('afterRender', this, function() {
			const geoJson = layer.feature,
				desc = geoJson.properties.address || geoJson.place_name,
				result = callIfPresent(this.get('onSelect'), latLng, desc, geoJson),
				after = this.refreshPopup.bind(this);
			if (result && result.then) { // is promise
				result.then(after);
			} else {
				Ember.run.later(this, after, this.get('timeout'));
			}
		});
	},
	deselectResult: function() {
		var results = this.get('_results');
		// update which result layer is active
		results.forEach(function(layer) {
			Ember.set(layer, 'status', '');
		});
		const result = callIfPresent(this.get('onDeselect')),
			after = this.refreshPopup.bind(this);
		if (result && result.then) { // is promise
			result.then(after);
		} else {
			Ember.run.later(this, after, this.get('timeout'));
		}
	},

	// Popups
	// ------

	refreshPopup: function() {
		// run next to give bindings time to synchronize
		Ember.run.next(this, this._doRefresh);
	},
	_doRefresh: function() {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		const map = this.get('_map'),
			latLng = this.get('location');
		if (Ember.isPresent(latLng)) { // open popup if location is present
			const desc = this.get('description'),
				display = desc || JSON.stringify(latLng);
			map.openPopup(this._buildPopupString(display), latLng, {
				keepInView: true,
				closeButton: false,
				closeOnClick: false,
				className: this.get('popupClass')
			});
			this.set('_isEditing', false);
		} else { // otherwise, close popup
			map.closePopup();
			this.set('_isEditing', true);
		}
	},
	_buildPopupString: function(description) {
		return `
			<h5>You\'ve selected this location!</h5>
			<p>${description}</p>
			<button>This isn't me</button>
		`;
	},
	centerAfterOpen: function(event) {
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
	}
});
