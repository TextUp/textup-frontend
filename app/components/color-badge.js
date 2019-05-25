import Component from '@ember/component';
import Constants from 'textup-frontend/constants';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    text: PropTypes.string.isRequired,
    color: PropTypes.string,
  }),
  getDefaultProps() {
    return { color: Constants.COLOR.BRAND };
  },

  tagName: 'span',
  attributeBindings: '_style:style',
  classNames: 'badge badge--outline',

  // Internal properties
  // -------------------

  _style: computed('color', function() {
    return htmlSafe(`border-color: ${this.get('color')};`);
  }),
});
