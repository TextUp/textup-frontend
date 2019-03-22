import * as TypeUtils from 'textup-frontend/utils/type';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { typeIsTeam } from 'textup-frontend/helpers/type/is-team';

module('Unit | Helper | type/is team');

test('helper', function(assert) {
  const randVal = Math.random(),
    isTeam = sinon.stub(TypeUtils, 'isTeam').returns(true);

  assert.equal(typeIsTeam([]), true);
  assert.ok(isTeam.calledOnce);
  assert.ok(isTeam.firstCall.calledWith(undefined));

  assert.equal(typeIsTeam([randVal]), true);
  assert.ok(isTeam.calledTwice);
  assert.ok(isTeam.secondCall.calledWith(randVal));

  isTeam.restore();
});
