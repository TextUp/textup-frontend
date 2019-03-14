import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import DS from 'ember-data';

const { get, merge } = Ember;

export default Ember.Mixin.create(DS.EmbeddedRecordsMixin, {
  attrs: {
    phone: { deserialize: 'records', serialize: 'records' },
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      rec1 = snapshot.record,
      data = rec1.get('hasPhoneActionData') ? rec1.get('phoneActionData') : Object.create(null),
      doActions = [];
    switch (rec1.get('phoneAction')) {
      case Constants.ACTION.PHONE.CHANGE_NUMBER:
        doActions.pushObject(changeToNewNumber(data));
        break;
      case Constants.ACTION.PHONE.DEACTIVATE:
        doActions.pushObject(deactivate());
        break;
      case Constants.ACTION.PHONE.TRANSFER:
        doActions.pushObject(transfer(data, Constants.MODEL.STAFF));
        break;
    }
    if (doActions.length) {
      json.phone = merge(json.phone || Object.create(null), { doPhoneActions: doActions });
    }
    return json;
  },
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
