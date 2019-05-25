import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Tag from 'textup-frontend/models/tag';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    tag: PropTypes.instanceOf(Tag),
    firstControlClass: PropTypes.string,
  }),
  getDefaultProps() {
    return { firstControlClass: '' };
  },

  classNames: 'form',
});
