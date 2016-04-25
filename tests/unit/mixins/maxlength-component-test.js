import Ember from 'ember';
import MaxlengthComponentMixin from 'textup-frontend/mixins/maxlength-component';
import { module, test } from 'qunit';

module('Unit | Mixin | maxlength component');

// Replace this with your real tests.
test('it works', function(assert) {
  let MaxlengthComponentObject = Ember.Object.extend(MaxlengthComponentMixin);
  let subject = MaxlengthComponentObject.create();
  assert.ok(subject);
});
