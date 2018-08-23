import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('record-text', 'Unit | Model | record text', {
  needs: [
    'service:constants',
    'model:contact',
    'model:tag',
    'model:media',
    'validator:number',
    'validator:has-any'
  ]
});

test('validating contents', function(assert) {
  const obj = this.subject(),
    done = assert.async();

  run(() => {
    const mediaObj = this.store().createRecord('media');
    obj.addRecipient('111 222 3333');

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'no contents or media');

        model.setProperties({
          contents: 'a message',
          media: null
        });
        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has contents');

        model.setProperties({
          contents: null,
          media: mediaObj
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'no contents and has media but is empty'
        );

        mediaObj.addChange('valid mime type', 'valid data', 88, 88);
        assert.ok(mediaObj.get('hasElements'));

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'media now has elements');
        done();
      });
  });
});

test('validating recipients', function(assert) {
  const obj = this.subject(),
    done = assert.async();
  run(() => {
    obj.set('contents', 'a message');
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
          true,
          'has at least one recipient of some type'
        );
        done();
      });
  });
});
