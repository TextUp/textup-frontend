import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';

moduleForComponent(
  'multi-select/display-badge',
  'Integration | Component | multi select/display badge',
  {
    integration: true,
    beforeEach() {
      this.inject.service('constants');
    }
  }
);

test('properties', function(assert) {
  this.render(hbs`{{multi-select/display-badge}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');

  this.setProperties({ obj: Ember.Object.create() });

  this.render(hbs`{{multi-select/display-badge entity=obj}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');

  assert.throws(() => this.render(hbs`{{multi-select/display-badge entity="not Ember obj"}}`));
});

test('displaying tag', function(assert) {
  const identifier = `${Math.random()}`,
    numMembers = Math.random(),
    mockTag = mockModel(88, this.get('constants.MODEL.TAG'), { identifier, numMembers });

  this.setProperties({ mockTag });

  this.render(hbs`{{multi-select/display-badge entity=mockTag}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.fa-tag').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
  assert.ok(text.includes(numMembers));
});

test('displaying contact', function(assert) {
  const identifier = `${Math.random()}`,
    mockContact = mockModel(88, this.get('constants.MODEL.CONTACT'), {
      identifier,
      isShared: false
    });

  this.setProperties({ mockContact });

  this.render(hbs`{{multi-select/display-badge entity=mockContact}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.fa-user').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
});

test('displaying shared contact', function(assert) {
  const identifier = `${Math.random()}`,
    mockShared = mockModel(88, this.get('constants.MODEL.CONTACT'), { identifier, isShared: true });

  this.setProperties({ mockShared });

  this.render(hbs`{{multi-select/display-badge entity=mockShared}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.fa-share').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
});

test('displaying other entity', function(assert) {
  const identifier = `${Math.random()}`,
    mockOther = mockModel(88, 'other', { identifier });

  this.setProperties({ mockOther });

  this.render(hbs`{{multi-select/display-badge entity=mockOther}}`);

  assert.ok(this.$('.horizontal-items').length, 'did render');
  assert.ok(this.$('.fa-asterisk').length);

  const text = this.$().text();
  assert.ok(text.includes(identifier));
});
