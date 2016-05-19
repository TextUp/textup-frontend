import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:collection', 'Unit | Validator | collection', {
  needs: ['validator:messages']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});
