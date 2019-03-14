import Ember from 'ember';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';

export default Ember.Component.extend({
  tabindex: defaultIfAbsent(0),
  selectIndex: null,
  disabled: defaultIfAbsent(false),
  wrapAround: defaultIfAbsent(true),
  indicatorClass: defaultIfAbsent('toggle-indicator'),

  classNames: 'multi-toggle',
  classNameBindings: ['canLeft:has-left', 'canRight:has-right'],
  canLeft: true,
  canRight: true,

  attributeBindings: ['style', 'tabIndex:tabindex'],
  _items: defaultIfAbsent([]),
  $indicators: null,

  // Computed properties
  // -------------------

  tabIndex: Ember.computed('tabindex', 'disabled', function() {
    return this.get('disabled') ? '' : this.get('tabindex');
  }),
  style: Ember.computed('_selectedIndex', function() {
    let style = '';
    const index = this.get('_selectedIndex');
    if (Ember.isPresent(index)) {
      const selected = this.get('_items').objectAt(index);
      style = `color: ${selected.complement};`;
    }
    return Ember.String.htmlSafe(style);
  }),
  $itemContainer: Ember.computed(function() {
    return this.$().children('.multi-toggle-items');
  }),
  publicAPI: Ember.computed(function() {
    return {
      currentIndex: null, // set during initialization
      actions: {
        moveLeft: this.moveLeft.bind(this),
        moveRight: this.moveRight.bind(this),
      },
    };
  }),

  // Events
  // ------

  didUpdateAttrs() {
    this._super(...arguments);
    Ember.run.next(this, this._setup.bind(this));
  },
  // run initial set-up here because this is called after the DOM is complete and so we
  // do not need to rely on unreliable timer functions to appropriately sequence our calls
  didRender() {
    this._super(...arguments);
    if (!this.get('$indicators')) {
      //need to schedule after render to next render to allow items to register
      Ember.run.scheduleOnce('afterRender', this, function() {
        const $indicators = this.build$Indicators(this.get('_items'));
        this.$('.multi-toggle-indicators').append($indicators);
        this.set('$indicators', $indicators);
        this._setup();
      });
    }
  },
  _setup() {
    const items = this.get('_items');
    if (items.length > 0) {
      let selectIndex = this.get('selectIndex');
      if (!selectIndex) {
        // defer to the items if null on parent
        const selected = items.filterBy('isSelected', true);
        let selectedItem = selected.get('firstObject');
        if (selected.length > 1) {
          // ensure only one selected
          selected.slice(1).forEach(function(item) {
            item.actions.deselect();
          });
        } else if (selected.length === 0) {
          // select first if none selected
          const firstItem = items.get('firstObject');
          selectedItem = firstItem;
          firstItem.actions.select(true);
        }
        selectIndex = items.indexOf(selectedItem);
      }
      this.slideToAndSetIndex(selectIndex, true);
    }
  },

  // Handlers
  // --------

  click(event) {
    const $t = Ember.$(event.target);
    if ($t.hasClass('left-toggle') || $t.closest('.left-toggle').length) {
      this.moveLeft();
    } else if ($t.hasClass('right-toggle') || $t.closest('.right-toggle').length) {
      this.moveRight();
    }
  },
  keyUp(event) {
    if (event.which === 37) {
      // left arrow key
      this.moveLeft();
    } else if (event.which === 39) {
      // right arrow key
      this.moveRight();
    }
  },

  // Actions
  // -------

  actions: {
    registerItem(item) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.get('_items').pushObject(item);
      });
    },
  },

  // Indicator bar
  // -------------

  build$Indicators(items) {
    const numItems = items.length,
      $indicators = items.map(this._buildIndicator.bind(this, numItems));
    return $indicators;
  },
  _buildIndicator(numItems, item) {
    const indClass = this.get('indicatorClass'),
      color = Ember.get(item, 'complement');
    return Ember.$(`<div class='${indClass}'
      style='background-color:${color};
        width:${100 / numItems}%;'></div>`);
  },

  // Helpers
  // -------

  moveLeft() {
    if (this.get('canLeft')) {
      this.slideToAndSetIndex(this.get('_selectedIndex') - 1);
    }
  },
  moveRight() {
    if (this.get('canRight')) {
      this.slideToAndSetIndex(this.get('_selectedIndex') + 1);
    }
  },
  slideToAndSetIndex(index, skipNotify = false) {
    // short circuit if disabled and NOT skip notify
    // do NOT short circuit if skip notify because this means that
    // we are calling this method internally, not from user input
    if (this.get('disabled') && !skipNotify) {
      return;
    }
    const items = this.get('_items'),
      normalized = this._normalizeIndex(index),
      prevIndex = this.get('_selectedIndex'),
      prev = Ember.isPresent(prevIndex) ? items.objectAt(prevIndex) : null,
      next = items.objectAt(normalized),
      $indicators = this.get('$indicators');
    // update selection
    if (prev) {
      $indicators.objectAt(prevIndex).removeClass('selected');
      prev.actions.deselect();
    }
    $indicators.objectAt(normalized).addClass('selected');
    next.actions.select(skipNotify);
    // update stored index
    this.setProperties({
      _selectedIndex: normalized,
      'publicAPI.currentIndex': normalized,
    });
    // shift item container to display selected object
    this.get('$itemContainer').css('left', `-${normalized * 100}%`);
    // update toggles
    this._setToggles(normalized);
  },
  _setToggles(normalized) {
    this.setProperties({
      canRight: true,
      canLeft: true,
    });
    if (this.get('wrapAround')) {
      return;
    }
    const lastIndex = this.get('_items.length') - 1;
    if (normalized === lastIndex) {
      this.set('canRight', false);
    } else if (normalized === 0) {
      this.set('canLeft', false);
    }
  },
  _normalizeIndex(index) {
    const numItems = this.get('_items.length');
    if (index < 0) {
      return numItems + index;
    } else if (index >= numItems) {
      return index - numItems;
    } else {
      return index;
    }
  },
});
