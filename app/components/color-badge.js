import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    text: PropTypes.string.isRequired,
    color: PropTypes.string,
  },
  getDefaultProps() {
    return { color: Constants.COLOR.BRAND };
  },

  tagName: 'span',
  attributeBindings: '_style:style',
  classNames: 'badge badge--outline',

  // Internal properties
  // -------------------

  _style: computed('color', function() {
    return Ember.String.htmlSafe(`border-color: ${this.get('color')};`);
  }),
});
