import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { ContactObject } from 'textup-frontend/objects/contact-object';

// Contacts for testing
const contacts = [
  ContactObject.create({ name: 'Person A', numbers: ['111-111-1111'] }),
  ContactObject.create({ name: 'Person B', numbers: ['222-222-2222', '333-333-3333'] }),
];

moduleForComponent('contacts-display', 'Integration | Component | contacts display', {
  integration: true,
});

test('it renders', function(assert) {
  this.render(hbs`{{contacts-display}}`);
  assert.ok(this.$('.contacts-display').length);
});

test('displays contact items', function(assert) {
  this.setProperties({ contacts });
  this.render(hbs`{{contacts-display contactObjects=contacts}}`);
  // displays 2 contact_items
  assert.equal($('.contacts-display__contact_item').length, 2);
});

test('toggle button checks', function(assert) {
  this.setProperties({ contacts });
  this.render(hbs`{{contacts-display contactObjects=contacts}}`);

  // before toggle unchecked
  assert.equal(false, $('.contacts-display__contact_item').find('input')[0].checked);
  // after toggle on checked
  this.$('.contacts-display__toggle').click();
  assert.equal(true, $('.contacts-display__contact_item').find('input')[0].checked);
  // after toggle off unchecked
  this.$('.contacts-display__toggle').click();
  assert.equal(false, $('.contacts-display__contact_item').find('input')[0].checked);
});

test('x of y imported banner', function(assert) {
  this.setProperties({ contacts });
  this.render(hbs`{{contacts-display contactObjects=contacts}}`);
  assert.equal(
    true,
    $('.contacts-display__stats')
      .text()
      .includes('0 of 2')
  );
  this.$('.contacts-display__toggle').click();
  assert.equal(
    true,
    $('.contacts-display__stats')
      .text()
      .includes('2 of 2')
  );
});

// TODO - once I figure out how import works test
/* test('imports contacts', function(assert) {
  // TODO: use spy to make streamlined, assert on args
  // use let instead of var, or const when
  var contacts2;
  var onImport = data => {
    contacts2 = data;
  };
  this.setProperties({ contacts, onImport });
  this.render(hbs`{{contacts-display contactObjects=contacts onImport=(action onImport)}}`);
  this.$('.contacts-display__toggle').click();
  this.$('.contacts-display__import').click();
  assert.equal(contacts2.length, contacts.length);
}); */
