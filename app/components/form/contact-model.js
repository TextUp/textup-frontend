import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Contact from 'textup-frontend/models/contact';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    contact: PropTypes.instanceOf(Contact),
    onGoToDuplicates: PropTypes.func,
    onAddNumber: PropTypes.func,
    onRemoveNumber: PropTypes.func
  },

  classNames: 'form',

  // Internal handlers
  // -----------------

  _onGoToDuplicates() {
    tryInvoke(this, 'onGoToDuplicates', [...arguments]);
  },
  _onAddNumber() {
    tryInvoke(this, 'onAddNumber', [...arguments]);
  },
  _onRemoveNumber() {
    tryInvoke(this, 'onRemoveNumber', [...arguments]);
  }
});
