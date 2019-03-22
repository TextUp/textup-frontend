import * as TypeUtils from 'textup-frontend/utils/type';
import sinon from 'sinon';
import { typeIsContact } from 'textup-frontend/helpers/type/is-contact';
import { module, test } from 'qunit';

module('Unit | Helper | type/is contact');

test('helper', function(assert) {
  const randVal = Math.random(),
    isContact = sinon.stub(TypeUtils, 'isContact').returns(true);

  assert.equal(typeIsContact([]), true);
  assert.ok(isContact.calledOnce);
  assert.ok(isContact.firstCall.calledWith(undefined));

  assert.equal(typeIsContact([randVal]), true);
  assert.ok(isContact.calledTwice);
  assert.ok(isContact.secondCall.calledWith(randVal));

  isContact.restore();
});
