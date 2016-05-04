import DS from 'ember-data';

export default DS.Model.extend({
	isAvailableNow: DS.attr('boolean'),
	nextAvailable: DS.attr('date'),
	nextUnavailable: DS.attr('date'),

	sunday: DS.attr('collection'),
	monday: DS.attr('collection'),
	tuesday: DS.attr('collection'),
	wednesday: DS.attr('collection'),
	thursday: DS.attr('collection'),
	friday: DS.attr('collection'),
	saturday: DS.attr('collection'),
});
