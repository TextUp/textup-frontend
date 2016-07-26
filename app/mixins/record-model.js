import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from '../utils/uniq-by';

const {
	sort
} = Ember.computed;

export default Ember.Mixin.create({

	// Attributes
	// ----------

	lastRecordActivity: DS.attr('date'),
	unsortedRecords: DS.hasMany('record'),
	uniqueRecords: uniqBy('unsortedRecords', 'id'),
	recordsSorting: ['whenCreated:desc'],
	records: sort('uniqueRecords', 'recordsSorting'),

	// Not attributes
	// --------------

	totalNumRecords: '--',
});
