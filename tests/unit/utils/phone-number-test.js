import PhoneNumber from 'textup-frontend/utils/phone-number';
import { module, test } from 'qunit';

module('Unit | Utility | phone number');

test('cleaning', function(assert) {
  assert.equal(PhoneNumber.clean(), undefined);
  assert.equal(PhoneNumber.clean(null), null);
  assert.equal(JSON.stringify(PhoneNumber.clean([])), JSON.stringify([]));
  assert.equal(JSON.stringify(PhoneNumber.clean({})), JSON.stringify({}));
  assert.equal(PhoneNumber.clean(''), '');
  assert.equal(PhoneNumber.clean('12  3a     ssdfsdfi #$#'), '123', 'only keeps digits');
});

test('validating', function(assert) {
  assert.equal(PhoneNumber.validate(), false);
  assert.equal(PhoneNumber.validate(null), false);
  assert.equal(PhoneNumber.validate([]), false);
  assert.equal(PhoneNumber.validate({}), false);
  assert.equal(PhoneNumber.validate(''), false);
  assert.equal(PhoneNumber.validate('213asf99kd'), false);

  assert.equal(PhoneNumber.validate('2223333'), false, 'default is must have area code');
  assert.equal(PhoneNumber.validate('1112223333'), true);

  assert.equal(PhoneNumber.validate('2223333', false), true);
  assert.equal(
    PhoneNumber.validate('1112223333', false),
    true,
    'can optionally also have area code'
  );
});

test('formatting', function(assert) {
  assert.equal(PhoneNumber.format(), undefined);
  assert.equal(PhoneNumber.format(null), null);
  assert.equal(JSON.stringify(PhoneNumber.format([])), JSON.stringify([]));
  assert.equal(JSON.stringify(PhoneNumber.format({})), JSON.stringify({}));
  assert.equal(PhoneNumber.format(''), '');

  assert.equal(
    PhoneNumber.format('2223333'),
    '2223333',
    'must have area code so just passes through'
  );
  assert.equal(PhoneNumber.format('1112223333'), '(111) 222 - 3333');

  assert.equal(PhoneNumber.format('2223333', false), '222 - 3333');
  assert.equal(
    PhoneNumber.format('1112223333', false),
    '(111) 222 - 3333',
    'can optionally also have area code'
  );
});
