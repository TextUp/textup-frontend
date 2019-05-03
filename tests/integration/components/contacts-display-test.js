import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { ContactObject } from 'textup-frontend/objects/contact-object';

moduleForComponent('contacts-display', 'Integration | Component | contacts display', {
  integration: true,
});

test('it renders', function(assert) {
  this.render(hbs`{{contacts-display}}`);
  assert.ok(this.$('.contacts_display').length);
});

test('displays contact items', function(assert) {
  var contacts = [];
  contacts.push(ContactObject.create({ name: 'Person A', numbers: ['111-111-1111'] }));
  contacts.push(ContactObject.create({ name: 'Person B', numbers: ['111-111-1111'] }));
  this.setProperties({ contacts });
  this.render(hbs`{{contacts-display contactObjects=contacts}}`);
  assert.equal($('div.contacts_display__contact_item').length, 2);
});

test('toggle button', function(assert) {
  assert.expect(3);
  var contacts = [];
  contacts.push(ContactObject.create({ name: 'Person A', numbers: ['111-111-1111'] }));
  contacts.push(ContactObject.create({ name: 'Person B', numbers: ['111-111-1111'] }));
  this.setProperties({ contacts });
  this.render(hbs`{{contacts-display contactObjects=contacts}}`);
  assert.equal(false, $('div.contacts_display__contact_item').find('input')[0].checked);
  this.$('.contacts-display-toggle').click();
  assert.equal(true, $('div.contacts_display__contact_item').find('input')[0].checked);
  this.$('.contacts-display-toggle').click();
  assert.equal(false, $('div.contacts_display__contact_item').find('input')[0].checked);
});

test('imports contacts', function(assert) {
  // TODO: use spy to make streamlined, assert on args
  // use let instead of var, or const when
  var contacts = [];
  contacts.push(ContactObject.create({ name: 'Person A', numbers: ['111-111-1111'] }));
  contacts.push(ContactObject.create({ name: 'Person B', numbers: ['111-111-1111'] }));
  var contacts2;
  var onImport = data => {
    contacts2 = data;
  };

  this.setProperties({ contacts, onImport });
  this.render(hbs`{{contacts-display contactObjects=contacts onImport=(action onImport)}}`);
  this.$('.contacts-display-toggle').click();
  this.$('#contacts-display-import').click();

  assert.equal(contacts2.length, contacts.length);
});
