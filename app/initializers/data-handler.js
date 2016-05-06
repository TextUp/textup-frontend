export function initialize(application) {
	application.inject('route', 'dataHandler', 'service:data');
}

export default {
	name: 'data-handler',
	initialize
};
