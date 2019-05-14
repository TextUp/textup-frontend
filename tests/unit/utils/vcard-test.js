import vcard from 'textup-frontend/utils/vcard';
import { module, test } from 'qunit';
import sinon from 'sinon';
import { GOOD_VCARD_DATA, BAD_VCARD_DATA } from 'textup-frontend/tests/helpers/utilities';

module('Unit | Utility | vcard');

// Consts for testing
const goodEvent = {
  target: {
    result: GOOD_VCARD_DATA,
    error: null,
  },
};
const badEvent = {
  target: {
    result: BAD_VCARD_DATA,
    error: null,
  },
};
const errorEvent = {
  target: {
    result: GOOD_VCARD_DATA,
    error: 'error reading data',
  },
};
test('parses good vcard', function(assert) {
  const resolveStub = sinon.stub();
  const rejectStub = sinon.stub();
  vcard._onFileLoad(resolveStub, rejectStub, goodEvent);
  assert.equal(resolveStub.calledOnce, true, 'resolved');
  console.log(resolveStub.firstCall.args[0]);
  assert.equal(resolveStub.firstCall.args[0][0].name, 'Forrest Gump');
  assert.equal(resolveStub.firstCall.args[0][1].name, 'Forrest Gump 2');
  assert.equal(resolveStub.firstCall.args[0][0].numbers[1], '4045551212');
  assert.equal(resolveStub.firstCall.args[0][1].numbers[0], '1115551212');
});
test('rejects bad vcard or error vcard', function(assert) {
  const resolveStub = sinon.stub();
  const rejectStub = sinon.stub();
  vcard._onFileLoad(resolveStub, rejectStub, badEvent);
  assert.equal(rejectStub.calledOnce, true, 'rejected');
  vcard._onFileLoad(resolveStub, rejectStub, errorEvent);
  assert.equal(rejectStub.calledTwice, true, 'rejected');
});
