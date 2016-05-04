import Ember from 'ember';

export function phoneNumber(params /*, hash*/ ) {
	if (!params[0]) {
		return '';
	}
	const number = params[0].replace(/\D+/g, '');
	if (number.length === 7) {
		return `${number.slice(0, 3)} - ${number.slice(3)}`;
	} else if (number.length === 10) {
		return `(${number.slice(0, 3)}) ${number.slice(3, 6)} - ${number.slice(6)}`;
	} else if (number.length === 11) {
		return `(${number.slice(1, 4)}) ${number.slice(4, 7)} - ${number.slice(7)}`;
	} else {
		return '';
	}
}

export default Ember.Helper.helper(phoneNumber);
