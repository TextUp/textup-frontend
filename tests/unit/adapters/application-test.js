import EmberObject from '@ember/object';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:application', 'Unit | Adapter | application', {
  needs: [
    'service:analytics',
    'service:authService',
    'service:dataService',
    'service:requestService',
    'service:stateService',
    'service:storageService',
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notification-messages-service', NotificationsService);
    this.inject.service('authService');
    this.inject.service('stateService');
  },
});

test('adding an authorization token header if present', function(assert) {
  const obj = this.subject(),
    authHeader = `${Math.random()}`;

  assert.deepEqual(obj.get('headers'), {});

  this.authService.setProperties({ authHeader });

  assert.deepEqual(obj.get('headers'), { Authorization: authHeader });
});

test('adding query parameter helper', function(assert) {
  const obj = this.subject(),
    url = `${Math.random()}`;

  assert.equal(
    obj._addQueryParam(null, 'key', 'val'),
    null,
    'returns url value if not all present'
  );
  assert.equal(obj._addQueryParam(url, null, 'val'), url, 'returns url value if not all present');
  assert.equal(obj._addQueryParam(url, 'key', null), url, 'returns url value if not all present');
  assert.equal(obj._addQueryParam(url, 'key', 'val'), `${url}?key=val`);
  assert.equal(
    obj._addQueryParam(`${url}?`, 'key', 'val'),
    `${url}?&key=val`,
    'does not add `?` if one exists'
  );
});

test('adding team id as query param to url', function(assert) {
  const obj = this.subject(),
    url = `${Math.random()}`,
    tId = `${Math.random()}`;

  assert.equal(obj._tryAddTeamId(null), null);

  this.stateService.setProperties({ ownerAsTeam: EmberObject.create({ id: null }) });

  assert.equal(obj._tryAddTeamId(url), url);

  this.stateService.set('ownerAsTeam.id', tId);

  assert.equal(obj._tryAddTeamId(url), `${url}?teamId=${tId}`);
});
