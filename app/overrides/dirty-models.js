import Ember from 'ember';
import DS from 'ember-data';

const {
	or
} = Ember.computed;

DS.Model.reopen({
	isDirty: or('hasDirtyAttributes', 'hasManualChanges'),
});
