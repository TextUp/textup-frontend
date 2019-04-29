import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('contact/unread-info', 'Unit | Model | contact/unread info');

test('is dirtiable', function(assert) {
  const model = this.subject();

  assert.ok(Dirtiable.detect(model));
});
