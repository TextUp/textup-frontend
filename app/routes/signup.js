import Ember from 'ember';
import Public from '../mixins/public-route';
import config from '../config/environment';

export default Ember.Route.extend(Public, {
	model: function() {
		return Ember.$.ajax({
			type: 'GET',
			url: `${config.host}/v1/public/organizations?status[]=approved`
		}).then((data) => {
			const orgs = data.organizations;
			return orgs ? orgs.map((org) => {
				return this.store.push(this.store.normalize('organization', org));
			}) : [];
		});
	},
	deactivate: function() {
		const selected = this.controller.get('selected');
		if (!selected) {
			return;
		}
		if (selected.get('isNew')) {
			selected.get('location.content').rollbackAttributes();
			selected.rollbackAttributes();
		} else if (selected.get('hasDirtyAttributes')) {
			selected.rollbackAttributes();
		}
	},
});
