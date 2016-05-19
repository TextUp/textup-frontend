import Ember from 'ember';
import moment from 'moment';

export function dateIsAfter(params /*, hash*/ ) {
	return moment(params[0]).isAfter(params[1]);
}

export default Ember.Helper.helper(dateIsAfter);
