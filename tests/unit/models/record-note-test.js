import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('record-note', 'Unit | Model | record note', {
  needs: [
    'service:constants',
    'model:contact',
    'model:tag',
    'model:media',
    'model:location',
    'model:record-note-revision',
    'validator:inclusion',
    'validator:has-any',
    'validator:presence',
    'validator:number'
  ]
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.notOk(obj.get('hasManualChanges'), 'no media yet');

  obj.set('media', this.store().createRecord('media'));

  assert.ok(obj.get('hasManualChanges'), 'now has media obj that is dirty');

  obj.set('media', null);

  assert.notOk(obj.get('hasManualChanges'), 'no media yet');

  obj.set('location', this.store().createRecord('location'));

  assert.ok(obj.get('hasManualChanges'), 'now has location obj that is dirty');

  obj.set('location', null);

  assert.notOk(obj.get('hasManualChanges'), 'no location yet');
});

test('validating content', function(assert) {
  const constants = this.container.lookup('service:constants'),
    obj = this.subject(),
    done = assert.async();

  run(() => {
    const mediaObj = this.store().createRecord('media');
    obj.addRecipient(mockModel('1', constants.MODEL.CONTACT));

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'no noteContents, media, or location'
        );

        model.setProperties({
          noteContents: 'a message',
          location: null,
          media: null
        });
        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has noteContents');

        model.setProperties({
          noteContents: null,
          location: null,
          media: mediaObj
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'no noteContents and has media but is empty'
        );

        mediaObj.addChange('valid mime type', 'valid data');
        assert.ok(mediaObj.get('hasElements'));

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'media now has elements');

        model.setProperties({
          noteContents: null,
          location: this.store().createRecord('location'),
          media: null
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'also valid with just location');

        done();
      });
  });
});

test('validating recipients', function(assert) {
  const constants = this.container.lookup('service:constants'),
    obj = this.subject(),
    done = assert.async(),
    mockContact = mockModel('1', constants.MODEL.CONTACT),
    mockTag = mockModel('2', constants.MODEL.TAG),
    mockSharedContact = mockModel('3', constants.MODEL.CONTACT, { isShared: true });
  run(() => {
    obj.set('noteContents', 'hello');

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'no recipients');

        model.addRecipient('111 222 3333');

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'recipient needs to be contact, shared contact, or tag'
        );

        model.removeRecipient('111 222 3333');
        model.addRecipient(mockContact);
        assert.equal(model.get('numRecipients'), 1);

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has one contact recipient');

        model.removeRecipient(mockContact);
        model.addRecipient(mockSharedContact);
        assert.equal(model.get('numRecipients'), 1);

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has one shared contact recipient');

        model.removeRecipient(mockSharedContact);
        model.addRecipient(mockTag);
        assert.equal(model.get('numRecipients'), 1);

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has one tag recipient');

        model.addRecipient(mockSharedContact);
        assert.equal(model.get('numRecipients'), 2);

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'must only have one recipient');

        done();
      });
  });
});

// Helpers
// -------

function mockModel(id, modelName, otherProps) {
  return Ember.Object.create({ id, constructor: { modelName }, ...otherProps });
}
