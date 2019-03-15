import Ember from 'ember';

const { computed } = Ember;

export default Ember.Service.extend({
  // Properties
  // ----------

  editingStaffId: computed.readOnly('_editingStaffId'),

  // Methods
  // -------

  setEditingStaff(staffId) {
    this.set('_editingStaffId', staffId);
  },
  clearEditingStaff() {
    this.set('_editingStaffId', null);
  },

  // Internal properties
  // -------------------

  _editingStaffId: null,
});
