import ArrayUtils from 'textup-frontend/utils/array';
import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { isPresent, tryInvoke } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    startIndex: PropTypes.number,
    doRegister: PropTypes.func,
    onChange: PropTypes.func,
  }),
  getDefaultProps() {
    return { startIndex: 0 };
  },

  classNames: 'tab-container',

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  // Internal properties
  // -------------------

  _hideShow: null,
  _hasTabOverflow: false,
  _items: computed(() => []),
  _currentItem: computed('_publicAPI.currentIndex', '_items.[]', function() {
    const index = this.get('_publicAPI.currentIndex'),
      items = this.get('_items');
    return items.objectAt(ArrayUtils.normalizeIndex(items.get('length'), index));
  }),
  _hasMultipleTabs: computed('_items.[]', function() {
    return this.get('_items.length') > 1;
  }),
  _$navlist: computed(function() {
    return this.$('.tab-container__nav__list');
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
    if (!isPresent(item) || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    scheduleOnce('afterRender', () => {
      this.get('_items').pushObject(item);
      scheduleOnce('afterRender', this, this._tryInitializeNav);
    });
  },
  _removeTabItem(item) {
    if (!isPresent(item) || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    scheduleOnce('afterRender', () => {
      this.get('_items').removeObject(item);
      scheduleOnce('afterRender', this, this._tryInitializeNav);
    });
  },

  _switchToNextIndex() {
    this._switchToIndex(this.get('_publicAPI.currentIndex') + 1);
  },
  _switchToPrevIndex() {
    this._switchToIndex(this.get('_publicAPI.currentIndex') - 1);
  },
  _switchToIndex(index) {
    if (!isPresent(index) || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const items = this.get('_items'),
      numItems = items.get('length'),
      itemIndex = ArrayUtils.normalizeIndex(numItems, index),
      currentIndex = ArrayUtils.normalizeIndex(numItems, this.get('_publicAPI.currentIndex'));
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
    this.set('_publicAPI.currentIndex', currentIndex); // normalize index if needed
    items.forEach((item, index) => item.actions.initialize(currentIndex === index));
    if (this.get('_hasMultipleTabs')) {
      scheduleOnce('afterRender', this, this._setupMultipleTabs);
    }
  },
  _setupMultipleTabs() {
    const $navlist = this.get('_$navlist'),
      contentWidth = $navlist[0].scrollWidth,
      displayWidth = $navlist[0].clientWidth;
    this.set('_hasTabOverflow', contentWidth > displayWidth);
  },
});
