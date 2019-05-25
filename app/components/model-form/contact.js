import Component from '@ember/component';
import Contact from 'textup-frontend/models/contact';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { tryInvoke } from '@ember/utils';

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

  // Internal handlers
  // -----------------

  _onGoToDuplicates() {
    tryInvoke(this, 'onGoToDuplicates', [...arguments]);
  },
  _onChangeNumbers() {
    tryInvoke(this, 'onChangeNumbers', [...arguments]);
  },
  _onAddNumber() {
    tryInvoke(this, 'onAddNumber', [...arguments]);
  },
  _onRemoveNumber() {
    tryInvoke(this, 'onRemoveNumber', [...arguments]);
  },
});
