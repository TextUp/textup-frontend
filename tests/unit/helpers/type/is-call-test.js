import TypeUtils from 'textup-frontend/utils/type';
import sinon from 'sinon';
import { typeIsCall } from 'textup-frontend/helpers/type/is-call';
import { module, test } from 'qunit';

module('Unit | Helper | type/is call');

test('helper', function(assert) {
  const randVal = Math.random(),
    isCall = sinon.stub(TypeUtils, 'isCall').returns(true);

  assert.equal(typeIsCall([]), true);
  assert.ok(isCall.calledOnce);
  assert.ok(isCall.firstCall.calledWith(undefined));

  assert.equal(typeIsCall([randVal]), true);
  assert.ok(isCall.calledTwice);
  assert.ok(isCall.secondCall.calledWith(randVal));

  isCall.restore();
});
