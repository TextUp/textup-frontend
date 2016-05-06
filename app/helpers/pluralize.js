import Ember from 'ember';
import Inflector from 'ember-inflector';

export function pluralize(params /*, hash*/ ) {
	const word = params[0],
		infl = Inflector.inflector;
	let count = params[1];
	if (isNaN(count)) {
		return word;
	}
	count = parseInt(count);
	return count === 1 ? infl.singularize(word) : infl.pluralize(word);
}

export default Ember.Helper.helper(pluralize);
