import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { phoneNumber } from 'textup-frontend/helpers/phone-number';

const { run } = Ember;

moduleForComponent('record-item/metadata', 'Integration | Component | record item/metadata', {
  integration: true
});

test('inputs', function(assert) {
  this.render(hbs`{{record-item/metadata}}`);

  assert.ok(this.$('.record-item__metadata').length, 'no inputs is ok');

  const validTime = new Date(),
    invalidTime = 'not time',
    validAuthor = 'kiki bai',
    invalidAuthor = 88;
  this.setProperties({ validTime, invalidTime, validAuthor, invalidAuthor });

  this.render(hbs`{{record-item/metadata timestamp=validTime author=validAuthor}}`);

  assert.ok(this.$('.record-item__metadata').length, 'valid inputs');

  assert.throws(() =>
    this.render(hbs`{{record-item/metadata timestamp=invalidTime author=invalidAuthor}}`)
  );
});

test('rendering', function(assert) {
  run(() => {
    const config = Ember.getOwner(this).resolveRegistration('config:environment'),
      done = assert.async();

    this.setProperties({ whenCreated: null, authorName: null });
    this.render(hbs`{{record-item/metadata timestamp=whenCreated author=authorName}}`);

    assert.notOk(
      this.$()
        .text()
        .trim(),
      'renders no text when both timestamp and author are null'
    );

    this.setProperties({ whenCreated: new Date(), authorName: null });
    // wait to allow re-render
    wait()
      .then(() => {
        const renderedText = this.$().text(),
          timestamp = moment(this.get('whenCreated')).format(config.moment.outputFormat),
          author = 'Unknown';

        assert.ok(renderedText.includes(timestamp), 'timestamp is humanized');
        assert.ok(
          renderedText.includes(author),
          'when timestamp is defined but no author, say "Unknown"'
        );

        this.setProperties({ whenCreated: null, authorName: Math.random() });
        return wait();
      })
      .then(() => {
        const renderedText = this.$().text(),
          author = this.get('authorName'),
          prettyPrintAuthor = phoneNumber([author]);

        assert.ok(renderedText.includes(author), 'author name no formatting if not phone number');
        assert.ok(renderedText.includes(prettyPrintAuthor));

        this.setProperties({ whenCreated: new Date(), authorName: '111 adfasdfj 222 sf  3 3 33' });
        return wait();
      })
      .then(() => {
        const renderedText = this.$().text(),
          timestamp = moment(this.get('whenCreated')).format(config.moment.outputFormat),
          author = this.get('authorName'),
          prettyPrintAuthor = phoneNumber([author]);

        assert.ok(renderedText.includes(timestamp), 'timestamp is humanized');
        assert.notOk(renderedText.includes(author), 'pretty prints author name if a phone number');
        assert.ok(renderedText.includes(prettyPrintAuthor));

        done();
      });
  });
});
