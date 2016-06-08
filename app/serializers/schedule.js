import DS from 'ember-data';

export default DS.RESTSerializer.extend({
	attrs: {
		isAvailableNow: {
			serialize: false
		},
		nextAvailable: {
			serialize: false
		},
		nextUnavailable: {
			serialize: false
		},
		sundayString: 'sunday',
		mondayString: 'monday',
		tuesdayString: 'tuesday',
		wednesdayString: 'wednesday',
		thursdayString: 'thursday',
		fridayString: 'friday',
		saturdayString: 'saturday',
	},
});
