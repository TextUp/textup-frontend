import * as PropertyUtils from 'textup-frontend/utils/property';
import Constants from 'textup-frontend/constants';
import sinon from 'sinon';
import { getConstantVal } from 'textup-frontend/helpers/constant';
import { module, test } from 'qunit';

module('Unit | Helper | constant');

test('helper', function(assert) {
  const inputVal = Math.random(),
    retVal = Math.random(),
    mustGet = sinon.stub(PropertyUtils, 'mustGet').returns(retVal);

  assert.equal(getConstantVal([]), retVal);
  assert.ok(mustGet.calledOnce);
  assert.ok(mustGet.firstCall.calledWith(Constants, ''));

  assert.equal(getConstantVal([inputVal]), retVal);
  assert.ok(mustGet.calledTwice);
  assert.ok(mustGet.secondCall.calledWith(Constants, inputVal + ''));

  mustGet.restore();
});
