import Ember from 'ember';

const {
	get
} = Ember;

export default Ember.Mixin.create({
	serialize: function(snapshot) {
		const json = this._super(...arguments),
			rec = snapshot.record,
			action = rec.get('phoneAction'),
			doActions = [];
		const data = rec.get('hasPhoneActionData') ?
			rec.get('phoneActionData') : Object.create(null);
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
		return json;
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
		actionItem.action = "DEACTIVATE";
		actions.pushObject(actionItem);
	},

	_transfer: function(actions, data) {
		const actionItem = Object.create(null),
			type = (get(data, 'type') === 'staff') ? 'INDIVIDUAL' : 'GROUP';
		actionItem.action = "TRANSFER";
		actionItem.id = get(data, 'id');
		actionItem.type = type;
		actions.pushObject(actionItem);
	}
});
