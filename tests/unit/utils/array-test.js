import ArrayUtils from 'textup-frontend/utils/array';
import sinon from 'sinon';
import { module, test } from 'qunit';

module('Unit | Utility | array');

test('normalizing array index', function(assert) {
  assert.equal(ArrayUtils.normalizeIndex(), 0);
  assert.equal(ArrayUtils.normalizeIndex('not number', 1), 0);
  assert.equal(ArrayUtils.normalizeIndex(1, 'not number'), 0);
  assert.equal(ArrayUtils.normalizeIndex(2, 1), 1);
  assert.equal(ArrayUtils.normalizeIndex(2, 2), 0);
  assert.equal(ArrayUtils.normalizeIndex(2, 3), 1);
  assert.equal(ArrayUtils.normalizeIndex(2, -1), 1);
  assert.equal(ArrayUtils.normalizeIndex(2, 0), 0);
});

test('ensuring passed-in is an array', function(assert) {
  const fn = () => [];
  assert.deepEqual(ArrayUtils.ensureArray(null), [null]);
  assert.deepEqual(ArrayUtils.ensureArray(fn), [fn]);
  assert.deepEqual(ArrayUtils.ensureArray(['hi']), ['hi']);
});

test('ensure no null or undefined values', function(assert) {
  assert.equal(ArrayUtils.ensureAllDefined(), undefined);
  assert.equal(ArrayUtils.ensureAllDefined(null), null);
  assert.equal(ArrayUtils.ensureAllDefined('hi'), 'hi');
  assert.deepEqual(ArrayUtils.ensureAllDefined([null, 'hi', undefined]), ['hi']);
});

test('trying to call all callbacks', function(assert) {
  const fn = sinon.spy();

  ArrayUtils.tryCallAll(null); // does not throw

  ArrayUtils.tryCallAll(fn);
  assert.ok(fn.calledOnce);

  ArrayUtils.tryCallAll([null, fn, fn, null]);
  assert.equal(fn.callCount, 3);
});
