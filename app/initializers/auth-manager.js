export function initialize(application) {
	application.inject('route', 'authManager', 'service:auth');
	application.inject('controller', 'authManager', 'service:auth');
}

export default {
	name: 'auth-manager',
	initialize
};
