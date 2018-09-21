import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { phoneNumber } from 'textup-frontend/helpers/phone-number';

const { run } = Ember;
let store;

moduleForComponent('record-item/receipts', 'Integration | Component | record item/receipts', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  }
});

test('inputs', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      rText = store.createRecord('record-text');
    this.setProperties({ rItem, rText });

    assert.throws(() => this.render(hbs`{{record-item/receipts}}`), 'requires item');

    this.render(hbs`{{record-item/receipts item=rItem}}`);

    assert.ok(this.$('.record-item__receipts').length, 'did render with record item');

    this.render(hbs`{{record-item/receipts item=rText}}`);

    assert.ok(this.$('.record-item__receipts').length, 'did render with subclass');
  });
});

test('disabled state', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      done = assert.async();
    this.setProperties({ rItem, disabled: true });

    this.render(hbs`{{record-item/receipts item=rItem disabled=disabled}}`);

    assert.ok(this.$('.record-item__receipts').length, 'did render with record item');
    assert.ok(this.$('.record-item__receipts--disabled').length, 'is disabled');

    this.set('disabled', false);
    wait()
      .then(() => {
        assert.ok(
          this.$('.record-item__receipts--disabled').length,
          'still disabled because no receipts'
        );

        rItem.set('receipts', { success: [] });
        return wait();
      })
      .then(() => {
        assert.ok(
          this.$('.record-item__receipts--disabled').length,
          'still disabled because receipt arrays are empty'
        );

        rItem.set('receipts', { success: ['1112223333'] });
        return wait();
      })
      .then(() => {
        assert.notOk(this.$('.record-item__receipts--disabled').length, 'not disabled anymore');
        done();
      });
  });
});

test('rendering block form', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      blockContent = Math.random();
    this.setProperties({ rItem, blockContent });

    this.render(hbs`
      {{#record-item/receipts item=rItem}}
        {{blockContent}}
      {{/record-item/receipts}}
    `);

    const text = this.$().text();
    assert.ok(this.$('.record-item__receipts').length, 'did render');
    assert.ok(text.includes(blockContent), 'block did render');
  });
});

test('trigger text', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item', {
        receipts: { success: null, pending: null, busy: null, failed: null }
      }),
      blockContent = Math.random(),
      done = assert.async();
    this.setProperties({ rItem, blockContent });

    this.render(hbs`
      {{#record-item/receipts item=rItem}}
        {{blockContent}}
      {{/record-item/receipts}}
    `);

    // no receipts
    assert.notOk(rItem.get('receipts.failed'), 'no failed numbers');
    assert.notOk(rItem.get('receipts.busy'), 'no busy numbers');
    assert.notOk(rItem.get('receipts.pending'), 'no pending numbers');
    assert.notOk(rItem.get('receipts.success'), 'no success numbers');

    let text = this.$().text();
    assert.ok(text.includes(blockContent), 'block still rendered');
    assert.ok(this.$('.record-item__receipts').length, 'did render');
    assert.notOk(
      this.$('.record-item__receipts__trigger__label').length,
      'no receipts = no trigger label'
    );

    // has failed
    rItem.set('receipts.failed', [Math.random()]);
    assert.ok(rItem.get('receipts.failed'), 'has failed numbers');
    assert.notOk(rItem.get('receipts.busy'), 'no busy numbers');
    assert.notOk(rItem.get('receipts.pending'), 'no pending numbers');
    assert.notOk(rItem.get('receipts.success'), 'no success numbers');

    // wait for rerender
    wait()
      .then(() => {
        text = this.$().text();
        assert.ok(
          this.$('.record-item__receipts__trigger__label').length,
          'has receipts = has trigger'
        );
        assert.ok(text.includes('fail'), 'trigger text is about failed numbers');

        // has failed + busy
        rItem.set('receipts.busy', [Math.random()]);
        assert.ok(rItem.get('receipts.failed'), 'has failed numbers');
        assert.ok(rItem.get('receipts.busy'), 'has busy numbers');
        assert.notOk(rItem.get('receipts.pending'), 'no pending numbers');
        assert.notOk(rItem.get('receipts.success'), 'no success numbers');

        return wait();
      })
      .then(() => {
        text = this.$().text();
        assert.ok(
          this.$('.record-item__receipts__trigger__label').length,
          'has receipts = has trigger'
        );
        assert.ok(text.includes('busy'), 'trigger text is about busy numbers');

        // has failed + busy + pending
        rItem.set('receipts.pending', [Math.random()]);
        assert.ok(rItem.get('receipts.failed'), 'has failed numbers');
        assert.ok(rItem.get('receipts.busy'), 'has busy numbers');
        assert.ok(rItem.get('receipts.pending'), 'has pending numbers');
        assert.notOk(rItem.get('receipts.success'), 'no success numbers');
        return wait();
      })
      .then(() => {
        text = this.$().text();
        assert.ok(
          this.$('.record-item__receipts__trigger__label').length,
          'has receipts = has trigger'
        );
        assert.ok(text.includes('pending'), 'trigger text is about pending numbers');

        // has failed + busy + pending + success
        rItem.set('receipts.success', [Math.random()]);
        assert.ok(rItem.get('receipts.failed'), 'has failed numbers');
        assert.ok(rItem.get('receipts.busy'), 'has busy numbers');
        assert.ok(rItem.get('receipts.pending'), 'has pending numbers');
        assert.ok(rItem.get('receipts.success'), 'has success numbers');
        return wait();
      })
      .then(() => {
        text = this.$().text();
        assert.ok(
          this.$('.record-item__receipts__trigger__label').length,
          'has receipts = has trigger'
        );
        assert.ok(text.includes('recipient'), 'trigger text is about successful recipients');

        done();
      });
  });
});

test('viewing receipt details', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item', {
        receipts: {
          success: [Math.random()],
          pending: [Math.random()],
          busy: [Math.random()],
          failed: [Math.random()]
        }
      }),
      done = assert.async();
    this.setProperties({ rItem });

    this.render(hbs`{{record-item/receipts item=rItem}}`);

    assert.ok(this.$('.record-item__receipts').length, 'did render');
    assert.ok(this.$('.record-item__receipts__trigger__label').length, 'has trigger');
    assert.notOk(this.$('.hide-away-body').length, 'receipt details are closed');

    this.$('.record-item__receipts__trigger')
      .first()
      .triggerHandler('click');

    wait()
      .then(() => {
        assert.ok(this.$('.record-item__receipts__body').length, 'receipt details are open');

        const text = this.$('.record-item__receipts__body').text();
        assert.ok(rItem.get('receipts.success').every(num => text.includes(phoneNumber([num]))));
        assert.ok(rItem.get('receipts.pending').every(num => text.includes(phoneNumber([num]))));
        assert.ok(rItem.get('receipts.busy').every(num => text.includes(phoneNumber([num]))));
        assert.ok(rItem.get('receipts.failed').every(num => text.includes(phoneNumber([num]))));

        this.$('.record-item__receipts__body')
          .children()
          .first()
          .triggerHandler('click');
        return wait();
      })
      .then(() => {
        assert.ok(
          this.$('.record-item__receipts__body').length,
          'clicking on body does not close receipts'
        );

        // click trigger again to close
        this.$('.record-item__receipts__trigger')
          .first()
          .triggerHandler('click');
        return wait();
      })
      .then(() => {
        assert.notOk(
          this.$('.record-item__receipts__body').length,
          'clicking trigger close receipts'
        );

        done();
      });
  });
});
