import Ember from 'ember';
import DS from 'ember-data';

const { get, merge } = Ember;

export default Ember.Mixin.create(DS.EmbeddedRecordsMixin, {
  constants: Ember.inject.service(),

  attrs: {
    hasInactivePhone: { serialize: false },
    phone: { deserialize: 'records', serialize: 'records' }
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      constants = this.get('constants'),
      rec1 = snapshot.record,
      data = rec1.get('hasPhoneActionData') ? rec1.get('phoneActionData') : Object.create(null),
      doActions = [];
    switch (rec1.get('phoneAction')) {
      case constants.PHONE.ACTION.CHANGE_NUMBER:
        doActions.pushObject(changeToNewNumber(data));
        break;
      case constants.PHONE.ACTION.DEACTIVATE:
        doActions.pushObject(deactivate());
        break;
      case constants.PHONE.ACTION.TRANSFER:
        doActions.pushObject(transfer(data, this.get('constants.MODEL.STAFF')));
        break;
    }
    if (doActions.length) {
      json.phone = merge(json.phone || Object.create(null), { doPhoneActions: doActions });
    }
    return json;
  }
});

function changeToNewNumber(data) {
  if (get(data, 'sid')) {
    return { action: 'NUMBYID', numberId: get(data, 'sid') };
  } else if (get(data, 'phoneNumber')) {
    return { action: 'NUMBYNUM', number: get(data, 'phoneNumber') };
  } else {
    return Object.create(null);
  }
}

function deactivate() {
  return { action: 'DEACTIVATE' };
}

function transfer(data, staffType) {
  const type = get(data, 'type') === staffType ? 'INDIVIDUAL' : 'GROUP';
  return { action: 'TRANSFER', id: get(data, 'id'), type };
}
