import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('record-call', 'Unit | Model | record call', {
  needs: ['model:contact', 'model:tag', 'model:media', 'validator:inclusion', 'validator:has-any'],
});

test('default values', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('stillOngoing'), false, 'by default not ongoing');
  assert.equal(obj.get('endOngoing'), false, 'by default do not want to end ongoing');
});

test('validating recipients', function(assert) {
  const obj = this.subject(),
    done = assert.async(),
    mockContact = mockModel('1', Constants.MODEL.CONTACT),
    mockSharedContact = mockModel('2', Constants.MODEL.CONTACT, { isShared: true });
  run(() => {
    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'no recipients');

        model.removeRecipient('111 222 3333');
        model.addRecipient(mockContact);
        assert.equal(model.get('numRecipients'), 1);

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has one recipient');

        model.addRecipient(mockSharedContact);
        assert.equal(model.get('numRecipients'), 2);

        return model.validate();
      })
      .then(({ validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'must either have a contact or shared contact recipient but not both'
        );

        done();
      });
  });
});
