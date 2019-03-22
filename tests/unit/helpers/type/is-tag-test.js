import * as TypeUtils from 'textup-frontend/utils/type';
import sinon from 'sinon';
import { typeIsTag } from 'textup-frontend/helpers/type/is-tag';
import { module, test } from 'qunit';

module('Unit | Helper | type/is tag');

test('helper', function(assert) {
  const randVal = Math.random(),
    isTag = sinon.stub(TypeUtils, 'isTag').returns(true);

  assert.equal(typeIsTag([]), true);
  assert.ok(isTag.calledOnce);
  assert.ok(isTag.firstCall.calledWith(undefined));

  assert.equal(typeIsTag([randVal]), true);
  assert.ok(isTag.calledTwice);
  assert.ok(isTag.secondCall.calledWith(randVal));

  isTag.restore();
});
