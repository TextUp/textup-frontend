import { run } from '@ember/runloop';
import { typeOf } from '@ember/utils';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('record-note-revision', 'Unit | Serializer | record note revision', {
  needs: [
    'serializer:record-note-revision',
    'model:media',
    'model:location',
    'validator:presence',
    'validator:number'
  ]
});

test('it serializes records', function(assert) {
  run(() => {
    const obj = this.subject();

    obj.setProperties({
      authorName: `${Math.random()}`,
      authorId: Math.random(),
      authorType: `${Math.random()}`,
      whenChanged: new Date(),
      noteContents: `${Math.random()}`,
      location: this.store().createRecord('location'),
      media: this.store().createRecord('media')
    });

    const json = obj.serialize();

    assert.ok(typeOf(json) === 'object');
    assert.deepEqual(new Date(json.whenChanged), obj.get('whenChanged'));
    assert.equal(json.noteContents, obj.get('noteContents'));
    assert.notOk(json.authorName);
    assert.equal(json.authorId);
    assert.equal(json.authorType);
    assert.equal(json.location);
    assert.equal(json.media);
  });
});
