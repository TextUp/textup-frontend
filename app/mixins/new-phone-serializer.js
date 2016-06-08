import Ember from 'ember';

export default Ember.Mixin.create({
	serialize: function(snapshot) {
		const json = this._super(...arguments),
			newPhone = snapshot.record.get('newPhone');
		if (newPhone) {
			this._buildNewPhone(json, newPhone);
			snapshot.record.set('newPhone', null);
			snapshot.record.set('addNewPhone', false);
			snapshot.record.set('forExistingPhone', null);
		}
		return json;
	},

	_buildNewPhone: function(json, phoneObj) {
		const phoneJson = json.phone ? json.phone : Object.create(null);
		if (phoneObj.sid) {
			phoneJson.newApiId = phoneObj.sid;
			delete phoneJson.number;
		} else {
			phoneJson.number = phoneObj.phoneNumber;
		}
		json.phone = phoneJson;
	}
});
