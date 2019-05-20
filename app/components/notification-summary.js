import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import Notification from 'textup-frontend/models/notification';
import PropTypeMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypeMixin, {
  propTypes: {
    notification: PropTypes.instanceOf(Notification),
    onOpen: PropTypes.func,
  },

  classNames: 'notification-summary',

  // Internal properties
  // -------------------

  _hasOnOpen: notEmpty('onOpen'),

  // Internal handlers
  // -----------------

  _onOpen() {
    tryInvoke(this, 'onOpen', [...arguments]);
  },
});
