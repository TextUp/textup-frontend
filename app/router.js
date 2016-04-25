import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType
});

Router.map(function() {
    this.route('login');
    this.route('signup', function() {
        this.route('new');
        this.route('account');
    });
    this.route('setup', function() {
        this.route('connect');
    });
    this.route('none');
    this.route('main', function() {
        this.route('contacts', function() {
            this.route('contact');
            this.route('many');
        });
        this.route('tag', function() {
            this.route('contact');
            this.route('many');
        });
    });
    this.route('admin', function() {
        this.route('pending');
        this.route('people', function() {
            this.route('person');
            this.route('many');
        });
        this.route('team', function() {
          this.route('person');
          this.route('many');
          this.route('edit');
        });
    });
});

export default Router;
