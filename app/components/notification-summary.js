import Ember from 'ember';
import Notification from 'textup-frontend/models/notification';
import PropTypeMixin, { PropTypes } from 'ember-prop-types';

const { tryInvoke, computed } = Ember;

export default Ember.Component.extend(PropTypeMixin, {
  propTypes: {
    notification: PropTypes.instanceOf(Notification),
    onOpen: PropTypes.func,
  },

  classNames: 'notification-summary',

  // Internal properties
  // -------------------

  _hasOnOpen: computed.notEmpty('onOpen'),

  // Internal handlers
  // -----------------

  _onOpen() {
    tryInvoke(this, 'onOpen', [...arguments]);
  },
});
