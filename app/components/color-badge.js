import { htmlSafe } from '@ember/template';
import Component from '@ember/component';
import { computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
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
    return htmlSafe(`border-color: ${this.get('color')};`);
  }),
});
