import MainContactsManyController from '../contacts/many';

export default MainContactsManyController.extend({
	_exitMany: function() {
		this.transitionToRoute('main.tag');
	}
});
