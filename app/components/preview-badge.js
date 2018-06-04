import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { abbreviate } from '../utils/text';
import { complement as findComplement } from '../utils/color';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  props: {
    content: PropTypes.string.isRequired,
    color: PropTypes.string,
    contrast: PropTypes.number,
    onlyShowFull: PropTypes.bool,
    displayMode: PropTypes.string
  },
  getDefaultProps() {
    return {
      color: this.get('constants.COLOR.BRAND'),
      contrast: 50,
      onlyShowFull: false,
      displayMode: this.get('constants.PREVIEW_BADGE.DISPLAY_MODE.BACKGROUND')
    };
  },

  tagName: 'span',
  attributeBindings: ['style'],
  classNames: 'badge',
  classNameBindings: '_isOutline:badge--outline',

  // Internal properties
  // -------------------

  _hideAway: null,

  // Computed properties
  // -------------------

  _isOutline: computed('displayMode', function() {
    return this.get('displayMode') === this.get('constants.PREVIEW_BADGE.DISPLAY_MODE.OUTLINE');
  }),
  complement: computed('color', function() {
    return findComplement(this.get('color'), this.get('contrast'));
  }),
  style: computed('color', 'complement', '_isOutline', function() {
    const color = this.get('color'),
      complement = this.get('complement');
    if (this.get('_isOutline')) {
      return Ember.String.htmlSafe(`border-color: ${color};`);
    } else {
      return Ember.String.htmlSafe(`background-color: ${color}; color:${complement}`);
    }
  }),
  abbreviated: computed('content', 'onlyShowFull', function() {
    if (this.get('onlyShowFull')) {
      return this.get('content');
    } else {
      return abbreviate(this.get('content'));
    }
  }),

  // Events
  // ------

  mouseEnter: function() {
    this.open();
  },
  mouseLeave: function() {
    this.close();
  },
  touchStart: function() {
    this.open();
  },
  touchEnd: function() {
    this.close();
  },
  touchCancel: function() {
    this.close();
  },

  // Helpers
  // -------

  open: function() {
    if (this.get('onlyShowFull')) {
      return;
    }
    Ember.run.cancel(this.get('_closeTimer'));
    const timer = Ember.run.later(this, this.get('_hideAway.actions.open'), 100);
    this.setProperties({
      _openTimer: timer,
      _closeTimer: null
    });
  },
  close: function() {
    if (this.get('onlyShowFull')) {
      return;
    }
    Ember.run.cancel(this.get('_openTimer'));
    const timer = Ember.run.later(this, this.get('_hideAway.actions.close'), 100);
    this.setProperties({
      _openTimer: null,
      _closeTimer: timer
    });
  }
});
