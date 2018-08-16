import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from 'textup-frontend/utils/uniq-by';
import { module, test } from 'qunit';

module('Unit | Utility | uniq by', {
  beforeEach() {
    const AsyncHelper = Ember.Object.extend({
      uniqueBooks: uniqBy('books', 'bookName'),
      books: Ember.computed({
        get() {
          return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(resolve => {
              resolve([{ bookName: 'apple' }, { bookName: 'apple' }, { bookName: 'banana' }]);
            })
          });
        },
        set(key, value) {
          return value;
        }
      })
    });
    this.asyncObject = AsyncHelper.create();
  }
});

test('returns a computed property', function(assert) {
  assert.ok(uniqBy() instanceof Ember.ComputedProperty);
});

test('handles synchronous dependent key', function(assert) {
  const TestHelper = Ember.Object.extend({
      books: [{ bookName: 'apple' }, { bookName: 'apple' }, { bookName: 'banana' }],
      uniqueBooks: uniqBy('books', 'bookName')
    }),
    testObj = TestHelper.create();

  let uBooks = testObj.get('uniqueBooks');
  assert.ok(!uBooks.then, 'is NOT a promise because dependent property is synchronous');
  assert.equal(uBooks.length, 2);

  testObj.get('books').pushObject({ bookName: 'cherry' });
  uBooks = testObj.get('uniqueBooks');
  assert.equal(uBooks.length, 3);

  Ember.set(testObj.get('books.firstObject'), 'bookName', 'orange');
  uBooks = testObj.get('uniqueBooks');
  assert.equal(uBooks.length, 4);
});

test('handles asynchronous dependent key', function(assert) {
  const done = assert.async();
  let getResult = this.asyncObject.get('uniqueBooks');
  assert.ok(getResult.then, 'IS a promise because dependent property is asynchronous');
  getResult.then(uBooks => {
    assert.equal(uBooks.length, 2);
    done();
  });
});

test('asynchronous dependent key adding objects', function(assert) {
  const done = assert.async();
  this.asyncObject.get('books').then(books => {
    books.pushObject({ bookName: 'cherry' });
    this.asyncObject.get('uniqueBooks').then(uBooks => {
      assert.equal(uBooks.length, 3);
      done();
    });
  });
});

test('asynchronous dependent key updating existing objects', function(assert) {
  const done = assert.async();
  this.asyncObject.get('books').then(books => {
    Ember.set(books.get('firstObject'), 'bookName', 'orange');
    this.asyncObject.get('uniqueBooks').then(uBooks => {
      assert.equal(uBooks.length, 3);
      done();
    });
  });
});
