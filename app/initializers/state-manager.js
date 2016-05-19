export function initialize(application) {
	application.inject('controller', 'stateManager', 'service:state');
	application.inject('route', 'stateManager', 'service:state');
}

export default {
	name: 'state-manager',
	initialize
};
