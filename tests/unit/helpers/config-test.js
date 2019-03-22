import * as PropertyUtils from 'textup-frontend/utils/property';
import configObj from 'textup-frontend/config/environment';
import { getConfigVal } from 'textup-frontend/helpers/config';
import { module, test } from 'qunit';

module('Unit | Helper | config');

test('getting config value', function(assert) {
  const inputVal = Math.random(),
    retVal = Math.random(),
    mustGet = sinon.stub(PropertyUtils, 'mustGet').returns(retVal);

  assert.equal(getConfigVal([]), retVal);
  assert.ok(mustGet.calledOnce);
  assert.ok(mustGet.firstCall.calledWith(configObj, ''));

  assert.equal(getConfigVal([inputVal]), retVal);
  assert.ok(mustGet.calledTwice);
  assert.ok(mustGet.secondCall.calledWith(configObj, inputVal + ''));

  mustGet.restore();
});
