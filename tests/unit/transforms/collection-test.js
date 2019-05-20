import { isArray } from '@ember/array';
import { moduleFor, test } from 'ember-qunit';

moduleFor('transform:collection', 'Unit | Transform | collection');

test('deserialize (api -> app)', function(assert) {
  const obj = this.subject();

  let result = obj.deserialize();
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(null);
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize('not an array');
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(888);
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(['hello']);
  assert.equal(isArray(result), true);
  assert.equal(result.length, 1);
  assert.equal(result.objectAt(0), 'hello');
});

test('serialize (api <- app)', function(assert) {
  const obj = this.subject();

  let result = obj.serialize();
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.serialize(null);
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.serialize('not an array    ');
  assert.equal(isArray(result), true);
  assert.equal(result.length, 1);
  assert.equal(result.objectAt(0), 'not an array', 'trimmed string becomes 1 element array');

  result = obj.serialize(888);
  assert.equal(isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.serialize('item1, item2, item3');
  assert.equal(isArray(result), true);
  assert.equal(result.length, 3);
  assert.equal(
    result.objectAt(1),
    'item2',
    'after splitting string, also trim whitespace for each'
  );

  result = obj.serialize(['hello']);
  assert.equal(isArray(result), true);
  assert.equal(result.length, 1);
  assert.equal(result.objectAt(0), 'hello');
});
