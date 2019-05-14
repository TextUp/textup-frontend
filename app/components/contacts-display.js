import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { ContactObject } from 'textup-frontend/objects/contact-object';

const { tryInvoke, computed, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onChange: PropTypes.func,
    contactObjects: PropTypes.arrayOf(PropTypes.instanceOf(ContactObject)),
  },

  classNames: 'contacts-display',

  // Internal properties
  // -------------------

  _contactItems: computed(() => []),
  _someSelected: computed.gt('_numSelect', 0),
  _numSelect: computed.alias('_selectedItems.length'),
  _selectedItems: computed.filterBy('_contactItems', 'isSelect', true),
  _numTotal: computed.alias('_contactItems.length'),

  // Internal handlers
  // -----------------

  _registerChild(child) {
    this.get('_contactItems').pushObject(child);
  },

  _onCheckboxChange() {
    run.debounce(this, this._handleCheckboxChange, 100);
  },
  _handleCheckboxChange() {
    tryInvoke(this, 'onChange', [this.get('_selectedItems').mapBy('data')]);
  },

  _toggleSelect() {
    if (this.get('_someSelected')) {
      this.get('_contactItems').forEach(child => child.actions.deselect());
    } else {
      this.get('_contactItems').forEach(child => child.actions.select());
    }
  },
});
