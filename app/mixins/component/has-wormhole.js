import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, isNone, assign } = Ember;

export default Ember.Mixin.create(PropTypesMixin, {
  propTypes: { wormholeClass: PropTypes.string },
  getDefaultProps() {
    return assign({ wormholeClass: '' }, this._super(...arguments));
  },

  init() {
    this._super(...arguments);
    this.get('_$wormholeParent').append(this.get('_$wormhole'));
  },
  didInsertElement() {
    this._super(...arguments);
    this._initWormhole();
  },
  willDestroyElement() {
    this._super(...arguments);
    this._cleanWormhole();
  },

  // Internal properties
  // -------------------

  // Need to override this property in order to return the element we want to move to the wormhole
  _elementToWormhole: null,

  _wormholeId: computed(function() {
    return `${this.elementId}--wormhole`;
  }),
  _$wormholeParent: computed(function() {
    const rootSelector = Ember.testing
      ? '#ember-testing'
      : Ember.getOwner(this).lookup('application:main').rootElement;
    return Ember.$(rootSelector);
  }),
  _$wormhole: computed('id', 'wormholeClass', function() {
    const id = this.get('_wormholeId'),
      wormholeClass = this.get('wormholeClass');
    return Ember.$(`<div id='${id}' class='${wormholeClass}'></div>`);
  }),

  // Internal handlers
  // -----------------

  _initWormhole() {
    const el = this.get('_elementToWormhole');
    if (isNone(el)) {
      return;
    }
    Ember.$(el)
      .detach()
      .appendTo(this.get('_$wormhole'));
  },
  _cleanWormhole() {
    this.get('_$wormhole').remove();
  }
});
