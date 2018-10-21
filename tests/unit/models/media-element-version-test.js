import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('media-element-version', 'Unit | Model | media element version', {});

test('default values', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('width'), null);
  assert.equal(obj.get('height'), null);
});

test('aliasing link to more-applicable source', function(assert) {
  run(() => {
    const obj = this.subject(),
      val1 = `${Math.random()}`,
      val2 = `${Math.random()}`;

    obj.set('link', val1);

    assert.equal(obj.get('link'), val1);
    assert.equal(obj.get('source'), val1);

    obj.set('source', val2);

    assert.equal(obj.get('link'), val2);
    assert.equal(obj.get('source'), val2);
  });
});
