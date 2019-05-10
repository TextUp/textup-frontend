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

  // TODO
  // _someSelected: computed('_contactItems.@each.isSelect', function() {
  //   return this.get('_contactItems').any(child => child && child.isSelect);
  // }),
  // _numSelect: computed('_contactItems.@each.isSelect', function() {
  //   const selected = this.get('_contactItems').filter(child => child && child.isSelect);
  //   // tryInvoke(this, 'onChange', [selected.mapBy('data')]); // TODO
  //   return selected.length;
  // }),
  // _numTotal: computed('_contactItems.[]', function() {
  //   return this.get('_contactItems.length');
  // }),

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
