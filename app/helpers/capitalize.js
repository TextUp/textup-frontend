import Ember from 'ember';

export function capitalize(params /*, hash*/ ) {
	const word = params[0] ? params[0] : '',
		numToCap = Ember.isPresent(params[1]) && !isNaN(params[1]) ? parseInt(params[1]) : 1;
	return word.slice(0, numToCap).toUpperCase() + word.slice(numToCap);
}

export default Ember.Helper.helper(capitalize);
