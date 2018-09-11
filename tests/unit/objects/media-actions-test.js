import Ember from 'ember';
import md5 from 'npm:blueimp-md5';
import { API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';
import { moduleFor, test } from 'ember-qunit';
import {
  AddChange,
  RemoveChange,
  ACTIONS_ID_PROP_NAME
} from 'textup-frontend/objects/media-actions';

const { get, typeOf } = Ember;

moduleFor('service:constants', 'Unit | Object | media actions');

test('add change', function(assert) {
  const constants = this.subject(),
    data = Math.random(),
    addChange = AddChange.create({
      [ACTIONS_ID_PROP_NAME]: Math.random(),
      mimeType: Math.random(),
      data: `${Math.random()},${data}`,
      // when adding, goes through parseInt in MediaImage.addVersion which truncates decimals
      width: Math.floor(Math.random() * 100),
      height: Math.floor(Math.random() * 100)
    }),
    mediaImage = addChange.toMediaImage(),
    addAction = addChange.toAction(constants);

  assert.equal(typeOf(mediaImage), 'instance');
  assert.equal(mediaImage.get(API_ID_PROP_NAME), addChange.get(ACTIONS_ID_PROP_NAME));
  assert.equal(mediaImage.get('mimeType'), addChange.get('mimeType'));
  assert.equal(mediaImage.get('versions.length'), 1);
  assert.equal(mediaImage.get('versions.firstObject.source'), addChange.get('data'));
  assert.equal(mediaImage.get('versions.firstObject.width'), addChange.get('width'));
  assert.equal(mediaImage.get('versions.firstObject.height'), addChange.get('height'));

  assert.equal(typeOf(addAction), 'object');
  assert.equal(get(addAction, 'action'), constants.ACTION.MEDIA.ADD);
  assert.equal(get(addAction, 'mimeType'), addChange.get('mimeType'));
  assert.equal(get(addAction, 'data'), data);
  assert.notEqual(get(addAction, 'checksum'), md5(addChange.get('data')));
  assert.equal(get(addAction, 'checksum'), md5(data), 'checksum is for data stripped of header');
});

test('remove change', function(assert) {
  const constants = this.subject(),
    removeChange = RemoveChange.create({ [ACTIONS_ID_PROP_NAME]: Math.random() }),
    removeAction = removeChange.toAction(constants);

  assert.equal(typeOf(removeAction), 'object');
  assert.equal(get(removeAction, 'action'), constants.ACTION.MEDIA.REMOVE);
  assert.equal(get(removeAction, ACTIONS_ID_PROP_NAME), removeChange.get(ACTIONS_ID_PROP_NAME));
});
