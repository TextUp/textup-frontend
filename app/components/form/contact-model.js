import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Contact from 'textup-frontend/models/contact';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    contact: PropTypes.instanceOf(Contact),
    onGoToDuplicates: PropTypes.func,
    onChangeNumbers: PropTypes.func,
    onAddNumber: PropTypes.func,
    onRemoveNumber: PropTypes.func,
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
