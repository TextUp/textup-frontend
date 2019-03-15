import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import Trackable from 'ember-cli-analytics/mixins/trackable';

const Router = Ember.Router.extend(Trackable, {
  location: config.locationType
});

Router.map(function() {
  this.route('error', { path: '/*wildcard' });

  // Public
  // ------

  this.route('login');
  this.route('reset');
  this.route('signup', function() {
    this.route('new');
    this.route('account');
  });
  this.route('setup');
  this.route('notify');

  // Auth
  // ----

  this.route('none');
  this.route('main', { path: '/main/:main_identifier' }, function() {
    this.route('contacts', function() {
      this.route('contact', { path: '/:id' });
      this.route('many');
    });
    this.route('tag', { path: '/tag/:tag_identifier' }, function() {
      this.route('contact', { path: '/contact/:id' });
      this.route('many');
      this.route('details');
    });
    this.route('search', function() {
      this.route('contact', { path: '/contact/:id' });
      this.route('many');
    });
  });
  this.route('admin', function() {
    this.route('pending');
    this.route('people', function() {
      this.route('person', { path: '/:id' });
      this.route('many');
    });
    this.route('team', { path: '/team/:team_identifier' }, function() {
      this.route('person', { path: '/person/:id' });
      this.route('many');
      this.route('edit');
    });
  });
  this.route('testing');
});

export default Router;
