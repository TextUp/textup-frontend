import DS from 'ember-data';

export default DS.Model.extend({
	number: DS.attr('string'),
	preference: DS.attr('number'),
	contact: DS.belongsTo('contact'),
});
