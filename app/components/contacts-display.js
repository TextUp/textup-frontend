import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { tryInvoke, computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onImport: PropTypes.func,
    contactObjects: PropTypes.array,
  },

  classNames: 'contacts-display',

  // Internal properties
  // -------------------

  _contactItems: computed(() => []),
  _someSelected: computed('_contactItems.@each.isSelect', function() {
    return this.get('_contactItems').any(child => child && child.isSelect);
  }),
  _numSelect: computed('_contactItems.@each.isSelect', function() {
    return this.get('_contactItems').filter(child => child && child.isSelect).length;
  }),
  _numTotal: computed('_contactItems.[]', function() {
    return this.get('_contactItems.length');
  }),

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