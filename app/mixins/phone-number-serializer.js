import Ember from 'ember';

export default Ember.Mixin.create({
	serialize: function(snapshot) {
		const json = this._super(...arguments),
			newPhone = snapshot.record.get('newPhone');
		if (newPhone) {
			this._buildNewPhone(json, newPhone);
			snapshot.record.set('newPhone', null);
		}
		return json;
	},

	_buildNewPhone: function(json, phoneObj) {
		if (phoneObj.sid) {
			json.newPhoneApiId = phoneObj.sid;
		} else {
			json.phone = phoneObj.phoneNumber;
		}
	}
});
