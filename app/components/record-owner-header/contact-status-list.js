import Constants from 'textup-frontend/constants';
import Contact from 'textup-frontend/models/contact';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, isArray, tryInvoke, getWithDefault } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    contacts: PropTypes.oneOfType([
      PropTypes.instanceOf(Contact),
      PropTypes.arrayOf(PropTypes.instanceOf(Contact)),
    ]).isRequired,
    onChange: PropTypes.func,
  },

  // Internal properties
  // -------------------

  _contactsIsAlreadyArray: computed('contacts', function() {
    return isArray(this.get('contacts'));
  }),
  _singleStatus: computed('contacts', function() {
    const contacts = this.get('contacts');
    return isArray(contacts) ? null : getWithDefault(contacts, 'status', '').toLowerCase();
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
