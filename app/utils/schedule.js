import Ember from 'ember';

// Formats relate to each other as follows:
// Api Format (array of strings)
// <-->
// Serialized (string) for appropriate dirty checking
// <-->
// Intervals (array of tuple arrays)

const betweenIntervalsDelimiter = ';',
	insideIntervalDelimiter = ':',
	daysOfWeek = [
		'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
		'saturday', 'sunday'
	];

function apiFormatToString(apiFormat) {
	if (!Ember.isArray(apiFormat)) {
		return apiFormat;
	}
	return apiFormat.join(betweenIntervalsDelimiter);
}

function stringToApiFormat(string) {
	return string ? string.split(betweenIntervalsDelimiter) : [];
}

function stringToIntervals(string) {
	const apiFormat = stringToApiFormat(string);
	return apiFormat.map(apiIntervalToInterval);
}

function intervalsToString(intervals) {
	if (!Ember.isArray(intervals)) {
		return intervals;
	}
	return apiFormatToString(intervals.map(intervalToApiInterval));
}

export {
	daysOfWeek,
	apiFormatToString,
	stringToApiFormat,
	stringToIntervals,
	intervalsToString
};

// Helpers
// -------

function apiIntervalToInterval(apiInterval) { // api interval is string
	const rangeObj = apiInterval && apiInterval.split(insideIntervalDelimiter);
	return (rangeObj.length === 2) ? rangeObj : apiInterval;
}

function intervalToApiInterval(interval) { // interval is an array
	return Ember.isArray(interval) ?
		`${interval[0]}${insideIntervalDelimiter}${interval[1]}` :
		interval;
}
