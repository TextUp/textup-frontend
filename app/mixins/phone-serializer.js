import Ember from 'ember';

const { get } = Ember;

export default Ember.Mixin.create({
  serialize: function(snapshot) {
    const json = this._super(...arguments),
      rec = snapshot.record,
      action = rec.get('phoneAction'),
      doActions = [];
    const data = rec.get('hasPhoneActionData') ? rec.get('phoneActionData') : Object.create(null);
    // deactivate and change number are mutually exclusive
    if (action === 'number') {
      this._changeToNewNumber(doActions, data);
    } else if (action === 'deactivate') {
      this._deactivate(doActions);
    } else if (action === 'transfer') {
      this._transfer(doActions, data);
    }

    if (doActions.length) {
      json.phone = Ember.merge(json.phone || Object.create(null), {
        doPhoneActions: doActions
      });
    }
    rec.set('phoneAction', null);
    rec.set('phoneActionData', null);

    // trim whitespace on the away message, but let the backend handle re-appending the
    // mandatory away message, if needed. We do this to remain backwards compatible with existing
    // away messages, which may be too long. If we re-appended here, updating a staff/team account
    // might generate a cryptic error message about the away message being too long.
    const phoneJson = json.phone;
    if (phoneJson && phoneJson.awayMessage) {
      // trim whitespace on away message
      phoneJson.awayMessage = phoneJson.awayMessage.replace(/^\s+|\s+$/g, '');
    }

    return json;
  },

  normalize(model, json) {
    const phoneJson = json.phone;
    if (phoneJson) {
      const awayMessage = phoneJson.awayMessage,
        mandatoryAddendum = phoneJson.mandatoryEmergencyMessage;
      if (awayMessage && mandatoryAddendum) {
        phoneJson.awayMessage = awayMessage.replace(mandatoryAddendum, '');
      }
    }
    return this._super(...arguments);
  },

  _changeToNewNumber: function(actions, data) {
    const actionItem = Object.create(null);
    if (data.sid) {
      actionItem.action = 'NUMBYID';
      actionItem.numberId = data.sid;
      actions.pushObject(actionItem);
    } else if (data.phoneNumber) {
      actionItem.action = 'NUMBYNUM';
      actionItem.number = data.phoneNumber;
      actions.pushObject(actionItem);
    }
  },

  _deactivate: function(actions) {
    const actionItem = Object.create(null);
    actionItem.action = 'DEACTIVATE';
    actions.pushObject(actionItem);
  },

  _transfer: function(actions, data) {
    const actionItem = Object.create(null),
      type = get(data, 'type') === 'staff' ? 'INDIVIDUAL' : 'GROUP';
    actionItem.action = 'TRANSFER';
    actionItem.id = get(data, 'id');
    actionItem.type = type;
    actions.pushObject(actionItem);
  }
});
