export function initialize(application) {
	application.inject('route', 'visibility', 'service:visibility');
	application.inject('controller', 'visibility', 'service:visibility');
}

export default {
	name: 'visibility',
	initialize
};
