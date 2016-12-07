import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';

export default Ember.Component.extend({
	displayProperty: null,
	identityProperty: null,
	filterProperty: null,
	inputComponent: 'multi-select/input',

	// pass the search term to create a new entry, to avoid creating
	// a new entry, return a falsy value, otherwise returning the created
	// object will trigger the onInsert action
	doCreate: null,
	onInsert: null,
	onReplace: null,
	onRemove: null,
	doSearch: null,
	doFilter: null,

	data: defaultIfAbsent([]),
	selected: defaultIfAbsent([]),
	delayThreshold: defaultIfAbsent(300),
	allowCreate: defaultIfAbsent(true),

	searchPlaceholder: defaultIfAbsent('Search here'),
	searchingMessage: defaultIfAbsent('Loading'),
	noResultsMessage: defaultIfAbsent('No results found'),

	bodyClass: defaultIfAbsent('multi-select-body'),
	itemClass: defaultIfAbsent(''),

	_dropdown: null,
	_input: null,

	// Computed properties
	// -------------------

	anyRemainingResults: Ember.computed.notEmpty('_remainingResults'),
	checkIdentity: Ember.computed.notEmpty('identityProperty'),
	dataIds: Ember.computed('identityProperty', 'data.[]', function() {
		return this.buildIds(this.get('data'));
	}),
	selectedIds: Ember.computed('identityProperty', 'selected.[]', function() {
		return this.buildIds(this.get('selected'));
	}),
	publicAPI: Ember.computed(function() {
		const dropdown = this.get('_dropdown'),
			input = this.get('_input');
		if (dropdown && input) {
			const myActions = {
				clearHighlight: this.clearHighlight.bind(this),
				maintainOrHighlightFirst: this.maintainOrHighlightFirst.bind(this),
				highlightUp: this.highlightUp.bind(this),
				highlightDown: this.highlightDown.bind(this)
			};
			return {
				isOpen: dropdown.isOpen,
				currentVal: input.currentVal,
				isCreating: input.isCreating,
				isEditing: input.isEditing,
				currentlyEditing: input.currentlyEditing,
				actions: Ember.merge(Ember.merge(myActions, dropdown.actions), input.actions)
			};
		} else {
			return {};
		}
	}),
	_lastSearchTerm: Ember.computed.alias('_input.currentVal'),
	_remainingResults: Ember.computed('_results.[]', 'selectedIds', function() {
		const results = this.get('_results');
		if (results && this.get('checkIdentity')) {
			const selectedIds = this.get('selectedIds'),
				prop = this.get('identityProperty');
			return results.filter((item) => {
				return !Ember.get(selectedIds, Ember.get(item, prop));
			});
		} else {
			return results;
		}
	}),

	// Events
	// ------

	// key press event to come before the key up event, so that
	// isCreating and isEditing statuses do not reflect the mode we
	// are about to enter.
	keyPress: function(event) {
		const val = event.target.value,
			anyRemaining = this.get('anyRemainingResults'),
			creating = this.get('_input.isCreating'),
			editing = this.get('_input.isEditing');
		// 13 is enter
		if (anyRemaining && event.which === 13 && Ember.isEmpty(val) &&
			(creating || editing)) {
			this.get('_input.actions.insert')(event);
		}
	},
	keyUp: function(event) {
		// keyboard nagivation only if has results
		if (this.get('anyRemainingResults')) {
			if (event.which === 38) { // up arrow key
				this.highlightUp();
			} else if (event.which === 40) { // down arrow key
				this.highlightDown();
			}
		}
	},

	// Actions
	// -------

	actions: {

		selectItem: function(item, index, event) {
			// run next in order to allow clickOnClose handler in
			// hide away to run first
			Ember.run.next(this, function() {
				this.highlightNode(this.getDataAt(index).node);
				if (this.get('_input.isEditing')) {
					this.get('_input.actions.update')(event);
				} else { // is creating
					this.get('_input.actions.insert')(event);
				}
			});
		},

		// Dropdown hooks
		// --------------

		inputStart: function(val, event) {
			Ember.run.cancel(this.get('_updateResultsTimer'));
			this.updateResults(val, true);
			if (this.get('_dropdown.isOpen') && this.get('_input.isCreating')) {
				this.get('_input.actions.stopEditing')();
			} else {
				Ember.run.scheduleOnce('afterRender', this, function() {
					this.get('_dropdown.actions.open')(event, true);
				});
			}
		},
		inputChange: function(val) {
			const delay = this.get('delayThreshold'),
				timer = Ember.run.debounce(this, this.updateResults, val, delay);
			this.set('_updateResultsTimer', timer);
		},
		afterDropdownOpen: function() {
			this.maintainOrHighlightFirst();
			this.get('_input.actions.focus')();
		},
		afterDropdownClose: function() {
			this.clearHighlight();
			this.get('_input.actions.stopEditing')();
		},
		inputEnd: function(val, event) {
			return this.insertOrUpdate(true, val, this.get('selected.length'), event);
		},

		// Input hooks
		// -----------

		update: function(item, val, event) {
			const promise = this.insertOrUpdate(false, val,
				this.get('selected').indexOf(item), event);
			this.get('_input.actions.stopEditing')();
			return promise;
		},
		insert: function(val, event) {
			return this.insertOrUpdate(false, val, this.get('selected.length'), event);
		},
		remove: function(item) {
			callIfPresent(this.get('onRemove'), item);
			Ember.run.next(this, this.setupResults);
		}
	},

	// Tag manipulation
	// ----------------

	insertOrUpdate: function(skipFocus, val, index, event) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			let promise;
			const $highlight = this.get('_currentHighlight');
			const object = ($highlight && $highlight.length) ?
				this.getDataAt($highlight.attr('data-index')).object : null;
			Ember.run.next(this, this.setupResults, skipFocus);
			if (this.get('anyRemainingResults') && object) {
				promise = this._doInsert(index, event, object);
			} else if (this.get('allowCreate')) {
				promise = this._doCreateAndInsert(val, index, event);
			} else {
				this.get('_input.actions.clear')();
			}
			//handle results
			if (promise && promise.then) {
				promise.then(resolve, reject);
			} else {
				// do nothing and clear input field
				resolve();
			}
			if (!this.highlightDown()) {
				this.highlightUp();
			}
		});
	},
	_doCreateAndInsert: function(val, index, event) {
		const created = callIfPresent(this.get('doCreate'), val, event);
		if (created) {
			return this._doInsert(index, event, created);
		}
	},
	_doInsert: function(index, event, toBeInserted) {
		return callIfPresent(this.get('onInsert'), index, toBeInserted, event);
	},
	getDataAt: function(index) {
		return {
			object: Ember.get(this.get('_remainingResults'), String(index)),
			node: this.$().find('.multi-select-item').eq(index)
		};
	},
	setupResults: function(skipFocus = false) {
		if (!skipFocus) {
			this.get('_input.actions.focus')();
		}
		// after ensuring focus is one of the few times where
		// the input field in tag input might be focused and so
		// isCreating will be true.
		const creating = this.get('_input.isCreating'),
			editing = this.get('_input.isEditing');
		if (creating) {
			this.updateResults(this.get('_input.currentVal'));
		}
		if (!creating && !editing) {
			this.get('_dropdown.actions.close')(null, true);
		}
	},

	// Keyboard navigation
	// -------------------

	clearHighlight: function() {
		if (this.isDestroying) {
			return;
		}
		this.$().find('.multi-select-item').removeClass('highlight');
	},
	maintainOrHighlightFirst: function() {
		if (this.get('anyRemainingResults')) {
			const $highlighted = this.$().find('.multi-select-item.highlight');
			if (!$highlighted.length) {
				const firstResult = this.$().find('.multi-select-item').first();
				firstResult.addClass('highlight');
				this.set("_currentHighlight", firstResult);
			} else {
				this.set('_currentHighlight', $highlighted);
			}
			this._scrollIntoView();
		}
	},
	highlightUp: function() {
		return this._highlightNeighbor(true);
	},
	highlightDown: function() {
		return this._highlightNeighbor(false);
	},
	_highlightNeighbor: function(moveUp) {
		// in case the highlight is not present for some reason
		Ember.run.throttle(this, this.maintainOrHighlightFirst, 1000);
		const $current = this.get('_currentHighlight');
		if ($current && $current.length) {
			const $neighbor = moveUp ? $current.prev('.multi-select-item') :
				$current.next('.multi-select-item');
			if ($neighbor && $neighbor.length) {
				this.highlightNode($neighbor);
				return true;
			}
		}
		return false;
	},
	highlightNode: function($node) {
		this.clearHighlight();
		$node.addClass('highlight');
		this.set('_currentHighlight', $node);
		this._scrollIntoView();
	},
	_scrollIntoView: function() {
		const $current = this.get('_currentHighlight');
		if ($current && $current.length) { // if there is a current highlight
			const $container = $current.parent(),
				fromTop = $current.position().top,
				scrollTop = $container.scrollTop(),
				elHeight = $current.outerHeight(),
				containerHeight = $container.innerHeight();
			// when item is below display area
			if (fromTop > (containerHeight - elHeight)) {
				$container.scrollTop(fromTop - containerHeight + elHeight + scrollTop);
			}
			// when item is above display area
			else if (fromTop < 0) {
				$container.scrollTop(fromTop + scrollTop);
			}
		}
	},

	// Result display methods
	// ----------------------

	updateResults: function(val, isOpening) {
		if (!isOpening) {
			Ember.run.scheduleOnce('afterRender', this, this.maintainOrHighlightFirst);
		}
		if (Ember.isBlank(val)) {
			this._handleBlankInput();
		} else {
			this.setProperties({
				_results: [],
				_resultIds: Object.create(null)
			});

			this._doSyncResults(val);
			if (val === this.get('_prevSearchVal')) {
				this._restoreAsyncResults();
			} else if (!isOpening) {
				this._doAsyncResults(val);
			}
		}
	},
	_handleBlankInput: function() {
		this.setProperties({
			_results: this.get('data'),
			_resultIds: this.get('dataIds')
		});
	},
	_doSyncResults: function(val) {
		const data = this.get('data');
		const {
			results: newResults,
			resultIds: newIds
		} = this._buildAll(data, val);
		this._listMergeInto(this.get('_results'), newResults);
		this._objectMergeInto(this.get('_resultIds'), newIds);
	},
	_restoreAsyncResults: function() {
		const results = this.get('_prevSearchResults'),
			resultIds = this.get('_prevSearchResultIds');
		if (results && resultIds) {
			this._listMergeInto(this.get('_results'), results);
			this._objectMergeInto(this.get('_resultIds'), resultIds);
		}
	},
	_doAsyncResults: function(val) {
		const searchResult = callIfPresent(this.get('doSearch'), val);
		if (!searchResult || !searchResult.then) {
			return;
		}
		this.set('isSearching', true);
		searchResult.then((asyncData) => {
			if (val === this.get('_lastSearchTerm') &&
				val !== this.get('_prevSearchVal') &&
				this.get('_dropdown.isOpen')) {
				const {
					results: newResults,
					resultIds: newIds
				} = this._buildAll(asyncData, val);
				this.setProperties({
					isSearching: false,
					_prevSearchVal: val,
					_prevSearchResults: newResults,
					_prevSearchResultIds: newIds
				});
				this._listMergeInto(this.get('_results'), newResults);
				this._objectMergeInto(this.get('_resultIds'), newIds);
				Ember.run.scheduleOnce('afterRender', this,
					this.maintainOrHighlightFirst);
			} else {
				this.set('isSearching', false);
			}
		});
	},
	_buildAll: function(data, val) {
		const resultIds = this.get('_resultIds'),
			matching = this._filter(data, val, resultIds);
		return {
			resultIds: this.buildIds(matching, resultIds),
			results: matching
		};
	},
	buildIds: function(data, existingIds = Object.create(null)) {
		const ids = Object.create(null);
		if (this.get('checkIdentity')) {
			data.mapBy(this.get('identityProperty')).forEach((matchId) => {
				if (!Ember.get(existingIds, matchId)) {
					Ember.set(ids, matchId, true);
				}
			});
		}
		return ids;
	},
	_filter: function(array, searchString, resultIds) {
		const customFilter = this.get('doFilter'),
			doFilter = customFilter ? customFilter : this._defaultFilter.bind(this);
		if (this.get('checkIdentity')) {
			const prop = this.get('identityProperty');
			return array.filter((item) => {
				return doFilter(searchString, item) &&
					!Ember.get(resultIds, Ember.get(item, prop));
			});
		} else {
			return array.filter(doFilter.bind(this, searchString));
		}
	},
	_defaultFilter: function(searchString, item) {
		const here = Ember.isPresent,
			fProp = this.get('filterProperty'),
			dProp = this.get('displayProperty'),
			iProp = this.get('identityProperty'),
			prop = here(fProp) ? fProp : (here(iProp) ? iProp : dProp),
			matchExp = new RegExp(searchString, 'i'),
			matchString = ((item && prop) ? Ember.get(item, prop) : item).toString();
		return matchString.search(matchExp) !== -1;
	},

	// Utility methods
	// ---------------

	_listMergeInto: function(target, toBeMerged) {
		target.pushObjects(toBeMerged);
	},
	_objectMergeInto: function(target, toBeMerged) {
		Ember.$.extend(target, toBeMerged);
	},
});
