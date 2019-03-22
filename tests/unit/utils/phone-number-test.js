import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import { module, test } from 'qunit';

module('Unit | Utility | phone number');

test('cleaning', function(assert) {
  assert.equal(PhoneNumberUtils.clean(), undefined);
  assert.equal(PhoneNumberUtils.clean(null), null);
  assert.equal(JSON.stringify(PhoneNumberUtils.clean([])), JSON.stringify([]));
  assert.equal(JSON.stringify(PhoneNumberUtils.clean({})), JSON.stringify({}));
  assert.equal(PhoneNumberUtils.clean(''), '');
  assert.equal(PhoneNumberUtils.clean('12  3a     ssdfsdfi #$#'), '123', 'only keeps digits');
});

test('validating', function(assert) {
  assert.equal(PhoneNumberUtils.validate(), false);
  assert.equal(PhoneNumberUtils.validate(null), false);
  assert.equal(PhoneNumberUtils.validate([]), false);
  assert.equal(PhoneNumberUtils.validate({}), false);
  assert.equal(PhoneNumberUtils.validate(''), false);
  assert.equal(PhoneNumberUtils.validate('213asf99kd'), false);

  assert.equal(PhoneNumberUtils.validate('2223333'), false, 'default is must have area code');
  assert.equal(PhoneNumberUtils.validate('1112223333'), true);

  assert.equal(PhoneNumberUtils.validate('2223333', false), true);
  assert.equal(
    PhoneNumberUtils.validate('1112223333', false),
    true,
    'can optionally also have area code'
  );
});

test('formatting', function(assert) {
  assert.equal(PhoneNumberUtils.format(), undefined);
  assert.equal(PhoneNumberUtils.format(null), null);
  assert.equal(JSON.stringify(PhoneNumberUtils.format([])), JSON.stringify([]));
  assert.equal(JSON.stringify(PhoneNumberUtils.format({})), JSON.stringify({}));
  assert.equal(PhoneNumberUtils.format(''), '');

  assert.equal(
    PhoneNumberUtils.format('2223333'),
    '2223333',
    'must have area code so just passes through'
  );
  assert.equal(PhoneNumberUtils.format('1112223333'), '(111) 222 - 3333');

  assert.equal(PhoneNumberUtils.format('2223333', false), '222 - 3333');
  assert.equal(
    PhoneNumberUtils.format('1112223333', false),
    '(111) 222 - 3333',
    'can optionally also have area code'
  );
});
