import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'multi-select/display-badge',
  'Integration | Component | multi select/display badge',
  {
    integration: true,
  }
);

test('properties', function(assert) {
  this.render(hbs`{{multi-select/display-badge}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');

  this.setProperties({ obj: Ember.Object.create() });

  this.render(hbs`{{multi-select/display-badge entity=obj}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
});

test('displaying tag', function(assert) {
  const identifier = `${Math.random()}`,
    numMembers = Math.random(),
    mockTag = mockModel(88, Constants.MODEL.TAG, {
      [Constants.PROP_NAME.READABLE_IDENT]: identifier,
      numMembers,
    });

  this.setProperties({ mockTag });

  this.render(hbs`{{multi-select/display-badge entity=mockTag}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.icon-tag').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
  assert.ok(text.includes(numMembers));
});

test('displaying contact', function(assert) {
  const identifier = `${Math.random()}`,
    mockContact = mockModel(88, Constants.MODEL.CONTACT, {
      [Constants.PROP_NAME.READABLE_IDENT]: identifier,
      isShared: false,
    });

  this.setProperties({ mockContact });

  this.render(hbs`{{multi-select/display-badge entity=mockContact}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.icon-person').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
});

test('displaying shared contact', function(assert) {
  const identifier = `${Math.random()}`,
    mockShared = mockModel(88, Constants.MODEL.CONTACT, {
      [Constants.PROP_NAME.READABLE_IDENT]: identifier,
      isShared: true,
    });

  this.setProperties({ mockShared });

  this.render(hbs`{{multi-select/display-badge entity=mockShared}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.fa-share').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
});

test('displaying other entity', function(assert) {
  const identifier = `${Math.random()}`,
    mockOther = mockModel(88, 'other', { [Constants.PROP_NAME.READABLE_IDENT]: identifier });

  this.setProperties({ mockOther });

  this.render(hbs`{{multi-select/display-badge entity=mockOther}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.fa-asterisk').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
});
