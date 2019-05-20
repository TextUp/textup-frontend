import Component from '@ember/component';
import { isArray } from '@ember/array';
import { tryInvoke } from '@ember/utils';
import { getWithDefault, computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import Contact from 'textup-frontend/models/contact';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    contacts: PropTypes.oneOfType([
      PropTypes.instanceOf(Contact),
      PropTypes.arrayOf(PropTypes.instanceOf(Contact)),
    ]).isRequired,
    onChange: PropTypes.func,
  },

  // Internal properties
  // -------------------

  _contactsIsAlreadyArray: computed('contacts.status', 'contacts.@each.status', function() {
    return isArray(this.get('contacts'));
  }),
  _singleStatus: computed('contacts.status', 'contacts.@each.status', function() {
    const contacts = this.get('contacts');
    return isArray(contacts)
      ? null
      : contacts && getWithDefault(contacts, 'status', '').toLowerCase();
  }),
  _singleContactIsUnread: computed('_singleStatus', function() {
    return this.get('_singleStatus') === Constants.CONTACT.STATUS.UNREAD.toLowerCase();
  }),
  _singleContactIsActive: computed('_singleStatus', function() {
    return this.get('_singleStatus') === Constants.CONTACT.STATUS.ACTIVE.toLowerCase();
  }),
  _singleContactIsArchived: computed('_singleStatus', function() {
    return this.get('_singleStatus') === Constants.CONTACT.STATUS.ARCHIVED.toLowerCase();
  }),
  _singleContactIsBlocked: computed('_singleStatus', function() {
    return this.get('_singleStatus') === Constants.CONTACT.STATUS.BLOCKED.toLowerCase();
  }),

  // Internal handlers
  // -----------------

  _onChange(newStatus) {
    tryInvoke(this, 'onChange', [newStatus]);
  },
});
