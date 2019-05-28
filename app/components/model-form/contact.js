import Component from '@ember/component';
import Contact from 'textup-frontend/models/contact';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    contact: PropTypes.instanceOf(Contact),
    onGoToDuplicates: PropTypes.func,
    onChangeNumbers: PropTypes.func,
    onAddNumber: PropTypes.func,
    onRemoveNumber: PropTypes.func,
    firstControlClass: PropTypes.string,
  }),
  getDefaultProps() {
    return { firstControlClass: '' };
  },

  classNames: 'form',
});
