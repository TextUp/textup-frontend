import Ember from 'ember';
import { mockModel } from '../../helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('record-call', 'Unit | Model | record call', {
  needs: [
    'service:constants',
    'model:contact',
    'model:tag',
    'model:media',
    'validator:inclusion',
    'validator:has-any'
  ]
});

test('validating recipients', function(assert) {
  const constants = this.container.lookup('service:constants'),
    obj = this.subject(),
    done = assert.async(),
    mockContact = mockModel('1', constants.MODEL.CONTACT),
    mockSharedContact = mockModel('2', constants.MODEL.CONTACT, { isShared: true });
  run(() => {
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
          'recipient needs to be either contact or shared contact'
        );

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
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'must either have a contact or shared contact recipient but not both'
        );

        done();
      });
  });
});

// Helpers
// -------

