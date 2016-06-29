import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import './models/custom-inflector-rules';
import 'npm:inobounce'; // import to allow enable detection inside script to run

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
	modulePrefix: config.modulePrefix,
	podModulePrefix: config.podModulePrefix,
	Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
