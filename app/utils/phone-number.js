import Ember from 'ember';

function clean(input) {
	if (!Ember.isPresent(input)) {
		return input;
	}
	const cleaned = input.replace(/\D+/g, '');
	return (cleaned.length === 11 && cleaned[0] === '1') ? cleaned.slice(1) : cleaned;
}

function validate(input, forceAreaCode = true) {
	const cleaned = clean(input),
		validLengths = forceAreaCode ? [10] : [7, 10];
	return validLengths.any((length) => cleaned && cleaned.length === length);
}

function format(input, forceAreaCode = true) {
	if (validate(input, forceAreaCode)) {
		const cleaned = clean(input);
		if (cleaned.length === 7) {
			return `${cleaned.slice(0, 3)} - ${cleaned.slice(3)}`;
		} else if (cleaned.length === 10) {
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} - ${cleaned.slice(6)}`;
		} else {
			return input;
		}
	} else {
		return input;
	}
}

export {
	clean,
	validate,
	format
};
