import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('owner-policy', 'Unit | Model | owner policy', {
  needs: ['model:schedule'],
});

test('is dirtiable', function(assert) {
  const model = this.subject();

  assert.ok(Dirtiable.detect(model));
});
