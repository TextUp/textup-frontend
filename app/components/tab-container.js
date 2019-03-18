import * as ArrayUtils from 'textup-frontend/utils/array';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, run, tryInvoke, isPresent } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    startIndex: PropTypes.number,
    doRegister: PropTypes.func,
    onChange: PropTypes.func,
  },
  getDefaultProps() {
    return { startIndex: 0 };
  },

  classNames: 'tab-container',

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  // Internal properties
  // -------------------

  _hideShow: null,
  _items: computed(() => []),
  _currentItem: computed('_publicAPI.currentIndex', '_items.[]', function() {
    const index = this.get('_publicAPI.currentIndex'),
      items = this.get('_items');
    return items.objectAt(ArrayUtils.normalizeIndex(items.get('length'), index));
  }),
  _hasMultipleTabs: computed('_items.[]', function() {
    return this.get('_items.length') > 1;
  }),
  _navListClass: computed(function() {
    return `nav-list-${this.elementId}`;
  }),
  _$navlist: computed('_navListClass', function() {
    return this.$().find(`.${this.get('_navListClass')}`);
  }),
  _publicAPI: computed(function() {
    return {
      currentIndex: this.get('startIndex'),
      actions: {
        next: this._switchToNextIndex.bind(this),
        prev: this._switchToPrevIndex.bind(this),
        register: this._addTabItem.bind(this),
        unregister: this._removeTabItem.bind(this),
      },
    };
  }),

  // Internal handlers
  // -----------------

  _addTabItem(item) {
    run.scheduleOnce('afterRender', () => {
      this.get('_items').pushObject(item);
      run.scheduleOnce('afterRender', this, this._tryInitializeNav);
    });
  },
  _removeTabItem(item) {
    run.scheduleOnce('afterRender', () => {
      this.get('_items').removeObject(item);
      run.scheduleOnce('afterRender', this, this._tryInitializeNav);
    });
  },

  _switchToNextIndex() {
    this._switchToIndex(this.get('_publicAPI.currentIndex') + 1);
  },
  _switchToPrevIndex() {
    this._switchToIndex(this.get('_publicAPI.currentIndex') - 1);
  },
  _switchToIndex(index) {
    if (!isPresent(index)) {
      return;
    }
    const items = this.get('_items'),
      itemIndex = ArrayUtils.normalizeIndex(items.get('length'), index),
      currentIndex = this.get('_publicAPI.currentIndex');

    if (currentIndex === itemIndex) {
      return;
    }
    const current = items.objectAt(currentIndex),
      target = items.objectAt(itemIndex);
    current.actions
      .hide()
      .then(() => target.actions.show())
      .then(() => {
        this.set('_publicAPI.currentIndex', itemIndex);
        tryInvoke(this, 'onChange', [current, target, this.get('_publicAPI')]);
      });
  },

  _tryInitializeNav() {
    const items = this.get('_items'),
      currentIndex = ArrayUtils.normalizeIndex(
        items.get('length'),
        this.get('_publicAPI.currentIndex')
      );
    items.forEach((item, index) => item.actions.initialize(currentIndex === index));
    if (this.get('_hasMultipleTabs')) {
      run.scheduleOnce('afterRender', this, this._setupMultipleTabs);
    }
  },
  _setupMultipleTabs() {
    const $navlist = this.get('_$navlist'),
      contentWidth = $navlist[0].scrollWidth,
      displayWidth = $navlist[0].clientWidth,
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
});
