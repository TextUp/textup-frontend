import * as TypeUtils from 'textup-frontend/utils/type';
import sinon from 'sinon';
import { typeIsNote } from 'textup-frontend/helpers/type/is-note';
import { module, test } from 'qunit';

module('Unit | Helper | type/is note');

test('helper', function(assert) {
  const randVal = Math.random(),
    isNote = sinon.stub(TypeUtils, 'isNote').returns(true);

  assert.equal(typeIsNote([]), true);
  assert.ok(isNote.calledOnce);
  assert.ok(isNote.firstCall.calledWith(undefined));

  assert.equal(typeIsNote([randVal]), true);
  assert.ok(isNote.calledTwice);
  assert.ok(isNote.secondCall.calledWith(randVal));

  isNote.restore();
});
