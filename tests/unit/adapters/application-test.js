import Ember from 'ember';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:application', 'Unit | Adapter | application', {
  needs: [
    'service:auth-service',
    'service:state',
    'service:data-service',
    'service:storage',
    'service:socket'
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notifications', NotificationsService);
  }
});

test('adding an authorization token header if present', function(assert) {
  const obj = this.subject(),
    token = `${Math.random()}`;

  assert.deepEqual(obj.get('headers'), {});

  obj.set('authService', { token });

  assert.deepEqual(obj.get('headers'), { Authorization: `Bearer ${token}` });
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

  obj.set('stateManager', { ownerAsTeam: Ember.Object.create({ id: null }) });

  assert.equal(obj._tryAddTeamId(url), url);

  obj.set('stateManager.ownerAsTeam.id', tId);

  assert.equal(obj._tryAddTeamId(url), `${url}?teamId=${tId}`);
});

test('adding team id if creating a record for team', function(assert) {
  const obj = this.subject(),
    url = `${Math.random()}`,
    tId = `${Math.random()}`;

  obj.set('stateManager', { ownerAsTeam: Ember.Object.create({ id: tId }) });

  assert.equal(
    obj._addTeamIdIfCreate(null, 'findRecord'),
    null,
    'returns url value if not all present'
  );
  assert.equal(
    obj._addTeamIdIfCreate(url, 'findRecord'),
    url,
    'returns url value if request not of type `createRecord`'
  );
  assert.equal(
    obj._addTeamIdIfCreate(url, 'createRecord'),
    `${url}?teamId=${tId}`,
    'returns url value if request not of type `createRecord`'
  );
});
