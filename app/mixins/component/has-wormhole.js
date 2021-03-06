import Ember from 'ember';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, isNone, assign } = Ember;

export default Ember.Mixin.create(PropTypesMixin, HasAppRoot, {
  propTypes: { wormholeClass: PropTypes.string },
  getDefaultProps() {
    return assign({ wormholeClass: '' }, this._super(...arguments));
  },

  init() {
    this._super(...arguments);
    this.get('_root').append(this.get('_$wormhole'));
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
