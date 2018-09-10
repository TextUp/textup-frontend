import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Contact from 'textup-frontend/models/contact';

const { computed, isArray, tryInvoke, getWithDefault } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    contacts: PropTypes.oneOfType([
      PropTypes.instanceOf(Contact),
      PropTypes.arrayOf(PropTypes.instanceOf(Contact))
    ]).isRequired,
    onChange: PropTypes.func
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
    return this.get('_singleStatus') === this.get('constants.CONTACT.STATUS.UNREAD').toLowerCase();
  }),
  _singleContactIsActive: computed('_singleStatus', function() {
    return this.get('_singleStatus') === this.get('constants.CONTACT.STATUS.ACTIVE').toLowerCase();
  }),
  _singleContactIsArchived: computed('_singleStatus', function() {
    return (
      this.get('_singleStatus') === this.get('constants.CONTACT.STATUS.ARCHIVED').toLowerCase()
    );
  }),
  _singleContactIsBlocked: computed('_singleStatus', function() {
    return this.get('_singleStatus') === this.get('constants.CONTACT.STATUS.BLOCKED').toLowerCase();
  }),

  // Internal handlers
  // -----------------

  _onChange(newStatus) {
    tryInvoke(this, 'onChange', [newStatus]);
  }
});
