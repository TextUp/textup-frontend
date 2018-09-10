import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  // Internal properties
  // -------------------

  _isOpen: false,
  _publicAPI: computed('_isOpen', function() {
    return {
      isOpen: this.get('_isOpen'),
      actions: {
        toggle: () => this._toggle(),
        open: () => this._open(),
        close: () => this._close()
      }
    };
  }),

  // Internal handlers
  // -----------------

  _toggle() {
    this.toggleProperty('_isOpen');
  },
  _open() {
    this.set('_isOpen', true);
  },
  _close() {
    this.set('_isOpen', false);
  }
});
