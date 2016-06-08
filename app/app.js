import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import './models/custom-inflector-rules';
import iNoBounce from 'npm:inobounce';

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
	modulePrefix: config.modulePrefix,
	podModulePrefix: config.podModulePrefix,
	Resolver,
	ready: function() {
		iNoBounce.enable();
	}
});

loadInitializers(App, config.modulePrefix);

export default App;
