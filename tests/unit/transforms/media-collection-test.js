import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('transform:media-collection', 'Unit | Transform | media collection');

test('deserializing (api <- app)', function(assert) {
  const obj = this.subject(),
    link = 'http://www.example.com',
    width = 888;

  let result = obj.deserialize();
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(null);
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize('not a list');
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize('not a list');
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(['not an object']);
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0, 'ignore nonobject items in list');

  assert.deepEqual(
    obj.deserialize([{ random: null, keys: null }]),
    [{ random: null, keys: null }],
    'all nonobject keys of items in list pass through'
  );
  assert.deepEqual(
    obj.deserialize([{ uid: 'hello', random: { link, width } }]),
    [{ uid: 'hello', random: { source: link, width } }],
    'only object keys with `link` attrib of item in list are transformed'
  );
});

test('serializing (api -> app)', function(assert) {
  assert.equal(this.subject().serialize('hello'), 'hello', 'pass-through while serializing');
});
