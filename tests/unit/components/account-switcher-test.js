import sinon from 'sinon';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('account-switcher', 'Unit | Component | account switcher', {
  unit: true,
});

test('required inputs', function(assert) {
  assert.throws(() => this.subject({}), 'required');
});
