import Ember from 'ember';

const {
	get
} = Ember;

function distance(coord1, coord2) {
	const xDist = _getX(coord1) - _getX(coord2),
		yDist = _getY(coord1) - _getY(coord2);
	return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

export {
	distance
};

// Helpers
// -------

function _getX(coord) {
	return Ember.isPresent(coord) ?
		Ember.isArray(coord) ? coord[0] : get(coord, 'x') :
		NaN;
}

function _getY(coord) {
	return Ember.isPresent(coord) ?
		Ember.isArray(coord) ? coord[1] : get(coord, 'y') :
		NaN;
}
