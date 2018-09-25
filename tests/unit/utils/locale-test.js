import Ember from 'ember';
import LocaleUtils from 'textup-frontend/utils/locale';
import { module, test } from 'qunit';

const { typeOf } = Ember;

module('Unit | Utility | locale');

test('wrapped methods return some value', function(assert) {
  assert.equal(typeOf(LocaleUtils.getTimezone()), 'string', 'timezone returns a string');
  assert.equal(
    typeOf(LocaleUtils.getCountryCode()),
    'string',
    'getting country code returns a string'
  );
});
