import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';

export default Ember.Component.extend({
  startIndex: defaultIfAbsent(0),
  animation: defaultIfAbsent('slide'), // none | slide | fade
  throttleThreshold: defaultIfAbsent(60),

  onChange: null,
  onChanged: null,
  doRegister: null,

  classNames: 'tab-container',

  _hideAway: null,
  _items: defaultIfAbsent([]),

  // Computed properties
  // -------------------

  _currentIndex: Ember.computed.reads('startIndex'),
  _currentItem: Ember.computed('_currentIndex', '_items.[]', function() {
    const index = this.get('_currentIndex'),
      items = this.get('_items');
    return this.indexIsValid(index) ? items.objectAt(index) : null;
  }),
  hasMultipleTabs: Ember.computed('_items.[]', function() {
    return this.get('_items.length') > 1;
  }),
  $navlist: Ember.computed(function() {
    return this.$().find('.tab-container-nav-list');
  }),
  publicAPI: Ember.computed('_currentIndex', function() {
    return {
      currentIndex: this.get('_currentIndex'),
      actions: {
        next: this.next.bind(this),
        prev: this.prev.bind(this)
      }
    };
  }),

  // Events
  // ------

  didInitAttrs: function() {
    this._super(...arguments);
    Ember.tryInvoke(this, 'doRegister', [this.get('publicAPI')]);
  },
  didInsertElement: function() {
    this._super(...arguments);
    Ember.run.next(this, function() {
      // initialize all items
      const current = this.get('_currentIndex'),
        animation = this.get('animation');
      this.get('_items').forEach(function(item, index) {
        item.actions.initialize(animation, current === index);
      }, this);
      if (this.get('hasMultipleTabs')) {
        this.setupNav();
      }
    });
  },

  // Actions
  // -------

  actions: {
    registerItem: function(item) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.get('_items').pushObject(item);
      });
    },
    switchIfSelected: function() {
      const switchIndex = this.get('_switchToIndex');
      if (Ember.isPresent(switchIndex)) {
        // actually begin the switching process
        // after the dropdown has finished closing
        this.switchTo(switchIndex);
      }
      this.set('_switchToIndex', null);
    },
    switchTo: function(index) {
      this.switchTo(index);
    },
    storeSwitchToIndex: function(itemIndex) {
      this.set('_switchToIndex', itemIndex);
    },
    next: function() {
      this.next();
    },
    prev: function() {
      this.prev();
    }
  },

  // Switch tabs
  // -----------

  next: function() {
    this.switchTo(this.get('_currentIndex') + 1);
  },
  prev: function() {
    this.switchTo(this.get('_currentIndex') - 1);
  },
  switchTo: function(index) {
    const itemIndex = this._normalizeIndex(index);
    if (this.get('_currentIndex') === itemIndex) {
      return;
    }
    const publicAPI = this.get('publicAPI'),
      dropdown = this.get('_hideAway'),
      items = this.get('_items'),
      current = items.objectAt(this.get('_currentIndex')),
      target = items.objectAt(itemIndex),
      animation = this.get('animation'),
      doSwitch = function() {
        current.actions.hide(animation).then(() => {
          target.actions.show(animation).then(() => {
            this.set('_currentIndex', itemIndex);
            Ember.tryInvoke(this, 'onChanged', [current, target, publicAPI]);
          });
        });
      }.bind(this);
    Ember.tryInvoke(this, 'onChange', [current, target, publicAPI]);
    if (dropdown.isOpen) {
      dropdown.actions.close(null, true, doSwitch);
    } else {
      doSwitch();
    }
  },

  // Nav
  // ---

  setupNav: function() {
    const $navlist = this.get('$navlist'),
      navlist = $navlist[0],
      displayWidth = navlist.clientWidth,
      contentWidth = navlist.scrollWidth,
      $parent = $navlist.parent();
    if (contentWidth > displayWidth) {
      $parent.addClass('overflow');
    } else {
      const $navItems = $navlist.children('.tab-container-nav-item'),
        numItems = $navItems.length;
      $parent.addClass('inline');
      $navItems.each(function() {
        Ember.$(this).css('width', `${100 / numItems}%`);
      });
    }
  },

  // Helpers
  // -------

  indexIsValid: function(index) {
    if (isNaN(index)) {
      return false;
    }
    return index >= 0 && index < this.get('_items.length');
  },
  _normalizeIndex: function(index) {
    const numItems = this.get('_items.length');
    if (index < 0) {
      return numItems + index;
    } else if (index >= numItems) {
      return index - numItems;
    } else {
      return index;
    }
  }
});
