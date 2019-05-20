import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('record-note-revision', 'Unit | Model | record note revision', {
  needs: ['model:location', 'model:media', 'validator:number', 'validator:presence']
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.notOk(obj.get('hasManualChanges'), 'no media yet');

  run(() => {
    obj.set('media', this.store().createRecord('media'));

    assert.ok(obj.get('hasManualChanges'), 'now has media obj that is dirty');

    obj.set('media', null);

    assert.notOk(obj.get('hasManualChanges'), 'no media yet');

    obj.set('location', this.store().createRecord('location'));

    assert.ok(obj.get('hasManualChanges'), 'now has location obj that is dirty');

    obj.set('location', null);

    assert.notOk(obj.get('hasManualChanges'), 'no location yet');
  });
});

test('non-object properties exist', function(assert) {
  const obj = this.subject();

  assert.notOk(obj.get('authorName'));
  assert.notOk(obj.get('authorId'));
  assert.notOk(obj.get('authorType'));
  assert.notOk(obj.get('whenChanged'));
  assert.notOk(obj.get('noteContents'));

  run(() => {
    obj.setProperties({
      authorName: 'testing',
      authorId: 'testing',
      authorType: 'testing',
      whenChanged: 'testing',
      noteContents: 'testing'
    });

    assert.ok(obj.get('authorName'));
    assert.ok(obj.get('authorId'));
    assert.ok(obj.get('authorType'));
    assert.ok(obj.get('whenChanged'));
    assert.ok(obj.get('noteContents'));
  });
});
