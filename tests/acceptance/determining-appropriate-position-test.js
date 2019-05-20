import { run } from '@ember/runloop';
import AuthService from 'textup-frontend/services/auth-service';
import Constants from 'textup-frontend/constants';
import moduleForAcceptance from 'textup-frontend/tests/helpers/module-for-acceptance';
import sinon from 'sinon';
import { test } from 'qunit';

let store, server, mockAuthService;

moduleForAcceptance('Acceptance | determining appropriate position', {
  beforeEach() {
    const container = this.application.__container__;
    store = container.lookup('service:store');
    server = sinon.createFakeServer({ respondImmediately: true });
    // For some reason, modifying the real authService, injecting the mock into all routes,
    // injecting the mock into the `application` route all break our testing set-up
    this.application.register('service:mockAuthService', AuthService);
    this.application.inject('route:admin', 'authService', 'service:mockAuthService');
    this.application.inject('route:login', 'authService', 'service:mockAuthService');
    this.application.inject('route:main', 'authService', 'service:mockAuthService');
    this.application.inject('route:none', 'authService', 'service:mockAuthService');
    this.application.inject('route:setup', 'authService', 'service:mockAuthService');
    mockAuthService = container.lookup('service:mockAuthService');
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

  mockAuthService.setProperties({ token: Math.random() + '', authUser: staff });

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

  mockAuthService.setProperties({ token: Math.random() + '', authUser: staff });

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

  mockAuthService.setProperties({ token: Math.random() + '', authUser: staff });

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
  mockAuthService.setProperties({ token: Math.random() + '', authUser: staff });
  server.respondWith(/\/v1\/staff\/*/, xhr => {
    xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ staff: [] }));
  });

  visit(`/main/${urlIdent}`);
  andThen(() => {
    assert.equal(currentURL(), '/admin/people');
    assert.equal(currentPath(), 'admin.people.index');
    assert.equal(currentRouteName(), 'admin.people.index');
  });
});

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

  mockAuthService.setProperties({ token: Math.random() + '', authUser: staff });
  server.respondWith(/\/v1\/contacts\/*/, xhr => {
    xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ contacts: [] }));
  });
  server.respondWith(/\/v1\/staff\/*/, xhr => {
    xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ staff: [] }));
  });

  visit(`/main/${urlIdent}`)
    .then(() => {
      assert.equal(currentURL(), `/main/${urlIdent}/contacts`);
      assert.equal(currentPath(), 'main.contacts.index');
      assert.equal(currentRouteName(), 'main.contacts.index');

      return visit('/admin');
    })
    .then(() => {
      assert.equal(currentURL(), '/admin/people');
      assert.equal(currentPath(), 'admin.people.index');
      assert.equal(currentRouteName(), 'admin.people.index');
    });
});
