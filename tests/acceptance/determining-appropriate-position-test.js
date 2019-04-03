import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import moduleForAcceptance from 'textup-frontend/tests/helpers/module-for-acceptance';
import sinon from 'sinon';
import { test } from 'qunit';

const { run } = Ember;
let store, server;

moduleForAcceptance('Acceptance | determining appropriate position', {
  beforeEach() {
    store = this.application.__container__.lookup('service:store');
    server = sinon.createFakeServer({ respondImmediately: true });
    // to bypass track location in application route's redirect method
    // note for some reason, the artifact name needs to be plural
    // see: https://davidtang.io/2017/09/03/mocking-dependencies-in-ember-acceptance-tests.html
    this.application.register('services:storage', Ember.Object.extend({ getItem: sinon.spy() }));
    this.application.inject('route:application', 'storage', 'services:storage');

    // to avoid hanging when redirecting to the login page
    this.application.register(
      'services:notifications',
      Ember.Object.extend({
        info: sinon.spy(),
        setDefaultClearNotification: sinon.spy(),
        setDefaultAutoClear: sinon.spy(),
      })
    );
    this.application.inject('route', 'notifications', 'services:notifications');
  },
  afterEach() {
    server.restore();
  },
});

test('no dynamic query param provided', function(assert) {
  visit('/main');
  andThen(() => {
    assert.equal(currentPath(), 'error', 'must provide the dynamic segment');
    assert.equal(currentRouteName(), 'error', 'must provide the dynamic segment');
  });
});

test('not logged in', function(assert) {
  visit('/main/staff-1');
  andThen(() => {
    assert.equal(currentURL(), '/login', 'must log in first');
    assert.equal(currentPath(), 'login');
    assert.equal(currentRouteName(), 'login');
  });
});

test('logged in user with nonexistent url segment logs user out', function(assert) {
  const urlIdent1 = 'testing-staff-segment',
    urlIdent2 = 'different-url-segment',
    staff = run(() => store.createRecord('staff', { [Constants.PROP_NAME.URL_IDENT]: urlIdent1 }));

  this.application.register(
    'services:auth-service',
    Ember.Object.extend({ isLoggedIn: true, authUser: staff })
  );
  this.application.inject('route:main', 'authService', 'services:auth-service');

  visit(`/main/${urlIdent2}`);
  andThen(() => {
    assert.equal(currentURL(), '/login');
    assert.equal(currentPath(), 'login');
    assert.equal(currentRouteName(), 'login');
  });
});

test('logged in user with no personal phone goes through setup', function(assert) {
  const urlIdent = 'testing-staff-segment',
    staff = run(() => store.createRecord('staff', { [Constants.PROP_NAME.URL_IDENT]: urlIdent }));

  this.application.register(
    'services:auth-service',
    Ember.Object.extend({ isLoggedIn: true, authUser: staff })
  );
  this.application.inject('route:main', 'authService', 'services:auth-service');
  this.application.inject('route:setup', 'authService', 'services:auth-service');

  visit(`/main/${urlIdent}`);
  andThen(() => {
    assert.equal(currentURL(), '/setup');
    assert.equal(currentPath(), 'setup');
    assert.equal(currentRouteName(), 'setup');
  });
});

test('logged in user has no phones and is not admin', function(assert) {
  const urlIdent = 'testing-staff-segment',
    staff = run(() =>
      store.createRecord('staff', {
        personalNumber: '626 888 1111', // to skip setup
        [Constants.PROP_NAME.URL_IDENT]: urlIdent,
      })
    );

  this.application.register(
    'services:auth-service',
    Ember.Object.extend({ isLoggedIn: true, authUser: staff })
  );
  this.application.inject('route:main', 'authService', 'services:auth-service');
  this.application.inject('route:none', 'authService', 'services:auth-service');

  visit(`/main/${urlIdent}`);
  andThen(() => {
    assert.equal(currentURL(), '/none');
    assert.equal(currentPath(), 'none');
    assert.equal(currentRouteName(), 'none');
  });
});

test('logged in user has no phones and is admin', function(assert) {
  const urlIdent = 'testing-staff-segment',
    staff = run(() =>
      store.createRecord('staff', {
        personalNumber: '626 888 1111', // to skip setup
        status: Constants.STAFF.STATUS.ADMIN,
        org: store.createRecord('organization', { status: Constants.ORGANIZATION.STATUS.APPROVED }),
        [Constants.PROP_NAME.URL_IDENT]: urlIdent,
      })
    );

  this.application.register(
    'services:auth-service',
    Ember.Object.extend({ isLoggedIn: true, authUser: staff })
  );
  this.application.inject('route:main', 'authService', 'services:auth-service');
  this.application.inject('route:admin', 'authService', 'services:auth-service');
  this.application.inject('controller:admin', 'authService', 'services:auth-service');

  server.respondWith(/\/v1\/staff\/*/, xhr => {
    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ staff: [], meta: { total: 0 } })
    );
  });

  visit(`/main/${urlIdent}`);
  andThen(() => {
    assert.equal(currentURL(), '/admin/people');
    assert.equal(currentPath(), 'admin.people.index');
    assert.equal(currentRouteName(), 'admin.people.index');
  });
});

// TODO need to test visiting admin because admin kicks back to main right now
test('logged in user has phones and is admin', function(assert) {
  const urlIdent = 'testing-staff-segment',
    staff = run(() =>
      store.createRecord('staff', {
        personalNumber: '626 888 1111', // to skip setup
        status: Constants.STAFF.STATUS.ADMIN,
        org: store.createRecord('organization', { status: Constants.ORGANIZATION.STATUS.APPROVED }),
        phone: store.createRecord('phone', { isActive: true }),
        [Constants.PROP_NAME.URL_IDENT]: urlIdent,
      })
    );

  this.application.register(
    'services:auth-service',
    Ember.Object.extend({ isLoggedIn: true, authUser: staff })
  );
  this.application.inject('route:main', 'authService', 'services:auth-service');
  this.application.inject('controller:main', 'authService', 'services:auth-service');

  server.respondWith(/\/v1\/staff\/*/, xhr => {
    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ staff: [], meta: { total: 0 } })
    );
  });

  visit(`/main/${urlIdent}`);
  andThen(() => {
    assert.equal(currentURL(), `/main/${urlIdent}/contacts`);
    assert.equal(currentPath(), 'main.contacts.index');
    assert.equal(currentRouteName(), 'main.contacts.index');
  });
});
