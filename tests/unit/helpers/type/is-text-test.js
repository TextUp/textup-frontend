import TypeUtils from 'textup-frontend/utils/type';
import sinon from 'sinon';
import { typeIsText } from 'textup-frontend/helpers/type/is-text';
import { module, test } from 'qunit';

module('Unit | Helper | type/is text');

test('helper', function(assert) {
  const randVal = Math.random(),
    isText = sinon.stub(TypeUtils, 'isText').returns(true);

  assert.equal(typeIsText([]), true);
  assert.ok(isText.calledOnce);
  assert.ok(isText.firstCall.calledWith(undefined));

  assert.equal(typeIsText([randVal]), true);
  assert.ok(isText.calledTwice);
  assert.ok(isText.secondCall.calledWith(randVal));

  isText.restore();
});
