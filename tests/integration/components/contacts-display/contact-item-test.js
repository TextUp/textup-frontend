import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'contacts-display/contact-item',
  'Integration | Component | contacts display/contact item',
  {
    integration: true,
  }
);

test('it renders', function(assert) {
  this.render(hbs`{{contacts-display/contact-item}}`);
  assert.ok(this.$('.contacts_display__contact_item').length);
});

test('public api', function(assert) {
  var items = [];
  var register = child => {
    items.push(child);
  };

  // test doRegister
  this.setProperties({ register });
  this.render(hbs`{{contacts-display/contact-item doRegister=(action register)}}`);
  assert.equal(items.length, 1);

  // test select
  items[0].actions.select();
  assert.ok(items[0].isSelect);
  assert.ok(Ember.$('div.contacts_display__contact_item').find('input')[0].checked);

  // test deselect
  items[0].actions.deselect();
  assert.equal(false, items[0].isSelect);
  assert.equal(false, Ember.$('div.contacts_display__contact_item').find('input')[0].checked);
});
