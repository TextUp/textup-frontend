import Service from '@ember/service';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('captcha-control', 'Unit | Component | captcha control', {
  unit: true,
  beforeEach() {
    this.register('service:captchaService', Service);
  },
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ onSuccess: 123, onFailure: 123, onExpiration: 123 }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
