import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { tryInvoke, computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onImport: PropTypes.func,
    contactObjects: PropTypes.array,
  },

  classNames: 'contacts_display',

  didInitAttrs() {
    this._super(...arguments);
  },

  // Internal properties
  // -------------------

  _someSelected: computed('_contactItems.@each.isSelect', function() {
    return this.get('_contactItems').any(child => child.isSelect);
  }),

  _contactItems: computed(() => []),

  // Internal handlers
  // -----------------

  _registerChild(child) {
    this.get('_contactItems').pushObject(child);
  },

  _toggleSelect() {
    if (this.get('_someSelected')) {
      this.get('_contactItems').forEach(child => child.actions.deselect());
    } else {
      this.get('_contactItems').forEach(child => child.actions.select());
    }
  },

  _submitContacts() {
    const dataToImport = this.get('_contactItems')
      .filterBy('isSelect', true)
      .mapBy('data');
    tryInvoke(this, 'onImport', [dataToImport]);
  },
});
