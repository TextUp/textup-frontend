import Constants from 'textup-frontend/constants';
import HintData from 'textup-frontend/data/hint-data';
import HintUtils from 'textup-frontend/utils/hint-info';
import { module, test } from 'qunit';

module('Unit | Utility | hint info');

test('getting title', function(assert) {
  assert.equal(HintUtils.getTitle(null), HintUtils.ERROR_TITLE);
  assert.equal(
    HintUtils.getTitle(Constants.HINT.CONTACT_ADD),
    HintData[Constants.HINT.CONTACT_ADD].title
  );
});

test('getting message', function(assert) {
  assert.equal(HintUtils.getMessage(null), '');
  assert.equal(
    HintUtils.getMessage(Constants.HINT.CONTACT_ADD),
    HintData[Constants.HINT.CONTACT_ADD].message
  );
});
