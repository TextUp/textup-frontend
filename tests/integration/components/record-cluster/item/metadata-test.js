import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { phoneNumber } from 'textup-frontend/helpers/phone-number';

const { run } = Ember;

moduleForComponent(
  'record-cluster/item/metadata',
  'Integration | Component | record cluster/item/metadata',
  {
    integration: true
  }
);

test('inputs', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      invalidItem = {},
      validItem = store.createRecord('record-item'),
      validText = store.createRecord('record-text');

    this.setProperties({ invalidItem, validItem, validText });

    assert.throws(() => this.render(hbs`{{record-cluster/item/metadata}}`), 'requires item');

    assert.throws(
      () => this.render(hbs`{{record-cluster/item/metadata item=invalidItem}}`),
      'item is incorrect type'
    );

    this.render(hbs`{{record-cluster/item/metadata item=validItem}}`);

    assert.ok(this.$('.record-item__metadata').length, 'rendered when passed in record item');

    this.render(hbs`{{record-cluster/item/metadata item=validText}}`);

    assert.ok(
      this.$('.record-item__metadata').length,
      'rendered when passed in record item subclass'
    );
  });
});

test('rendering', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      config = Ember.getOwner(this).resolveRegistration('config:environment'),
      item = store.createRecord('record-item'),
      done = assert.async();

    this.set('item', item);
    this.render(hbs`{{record-cluster/item/metadata item=item}}`);

    assert.notOk(
      this.$()
        .text()
        .trim(),
      'renders no text when both timestamp and author are null'
    );

    item.setProperties({ whenCreated: new Date(), authorName: null });
    // wait to allow re-render
    wait()
      .then(() => {
        const renderedText = this.$().text(),
          timestamp = moment(item.get('whenCreated')).format(config.moment.outputFormat),
          author = 'Unknown';

        assert.ok(renderedText.includes(timestamp), 'timestamp is humanized');
        assert.ok(
          renderedText.includes(author),
          'when timestamp is defined but no author, say "Unknown"'
        );

        item.setProperties({ whenCreated: null, authorName: Math.random() });
        return wait();
      })
      .then(() => {
        const renderedText = this.$().text(),
          author = item.get('authorName'),
          prettyPrintAuthor = phoneNumber([author]);

        assert.ok(renderedText.includes(author), 'author name no formatting if not phone number');
        assert.ok(renderedText.includes(prettyPrintAuthor));

        item.setProperties({ whenCreated: new Date(), authorName: '111 adfasdfj 222 sf  3 3 33' });
        return wait();
      })
      .then(() => {
        const renderedText = this.$().text(),
          timestamp = moment(item.get('whenCreated')).format(config.moment.outputFormat),
          author = item.get('authorName'),
          prettyPrintAuthor = phoneNumber([author]);

        assert.ok(renderedText.includes(timestamp), 'timestamp is humanized');
        assert.notOk(renderedText.includes(author), 'pretty prints author name if a phone number');
        assert.ok(renderedText.includes(prettyPrintAuthor));

        done();
      });
  });
});
