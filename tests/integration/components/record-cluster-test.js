import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { run } = Ember;
let store;

moduleForComponent('record-cluster', 'Integration | Component | record cluster', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  },
});

test('inputs', function(assert) {
  const rCluster = RecordCluster.create(),
    validOpts = {},
    invalidOpts = 'hi';
  this.setProperties({ rCluster, validOpts, invalidOpts });

  assert.throws(() => this.render(hbs`{{record-cluster}}`), 'requires cluster');

  this.render(hbs`{{record-cluster cluster=rCluster callOptions=validOpts noteOptions=validOpts}}`);

  assert.ok(this.$('.ember-view').length, 'did render');

  assert.throws(
    () =>
      this.render(
        hbs`{{record-cluster cluster=rCluster callOptions=invalidOpts noteOptions=invalidOpts}}`
      ),
    'if specified, note options must be an object'
  );
});

test('rendering block empty cluster', function(assert) {
  const blockText = Math.random(),
    rCluster = RecordCluster.create();
  this.setProperties({ rCluster, blockText });

  this.render(hbs`
    {{#record-cluster cluster=rCluster}}
      {{blockText}}
    {{/record-cluster}}
  `);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(this.$('.record-cluster').length, 'no cluster');
  assert.notOk(this.$('.record-cluster__item').length, 'no cluster item');
  assert.equal(
    this.$()
      .text()
      .trim(),
    '',
    'renders nothing for empty cluster'
  );
});

test('rendering block cluster of one', function(assert) {
  run(() => {
    const blockText = Math.random(),
      blockSpy = sinon.spy(),
      rCluster = RecordCluster.create({ items: [store.createRecord('record-item')] }),
      done = assert.async();
    this.setProperties({ rCluster, blockSpy, blockText });

    this.render(hbs`
      {{#record-cluster cluster=rCluster as |item index|}}
        <span class="test-block" onclick={{action blockSpy item index}}>{{blockText}}</span>
      {{/record-cluster}}
    `);

    assert.notOk(this.$('.record-cluster').length, 'no cluster');
    assert.ok(this.$('.record-cluster__item').length, 'has cluster item');
    const text = this.$().text();
    assert.equal(text.match(new RegExp(blockText, 'gi')).length, 1);

    this.$('.test-block')
      .first()
      .triggerHandler('click');
    assert.ok(blockSpy.calledOnce);
    assert.deepEqual(blockSpy.firstCall.args[0], rCluster.get('items.firstObject'));
    assert.equal(blockSpy.firstCall.args[1], 0);

    rCluster.set('alwaysCluster', true);
    wait().then(() => {
      assert.ok(this.$('.record-cluster').length, 'can cluster even one if always cluster is set');
      assert.notOk(
        this.$('.record-cluster__item').length,
        'items not shown initially if clustered'
      );

      done();
    });
  });
});

test('rendering block cluster of several + opening and closing', function(assert) {
  run(() => {
    const blockText = Math.random(),
      blockSpy = sinon.spy(),
      rCluster = RecordCluster.create({
        label: `${Math.random()}`,
        items: Array(8)
          .fill()
          .map(() => store.createRecord('record-item')),
      }),
      done = assert.async();
    this.setProperties({ rCluster, blockSpy, blockText });

    this.render(hbs`
      {{#record-cluster cluster=rCluster as |item index|}}
        <span class="test-block" onclick={{action blockSpy item index}}>{{blockText}}</span>
      {{/record-cluster}}
    `);

    assert.ok(this.$('.record-cluster').length, 'has cluster');
    assert.notOk(this.$('.record-cluster__body').length, 'cluster starts out closed');
    assert.notOk(this.$('.record-cluster__item').length, 'no items shown');
    assert.equal(this.$('.record-cluster__trigger').length, 1, 'has OPEN trigger');

    let text = this.$().text();
    assert.ok(text.includes(rCluster.get('label')), 'cluster label is shown');

    this.$('.record-cluster__trigger')
      .first()
      .triggerHandler('click');
    wait()
      .then(() => {
        assert.ok(this.$('.record-cluster__body').length, 'cluster is open');
        assert.ok(this.$('.record-cluster__item').length, 'items are shown when cluster is open');
        assert.ok(this.$('.record-cluster__trigger').length);

        text = this.$().text();
        assert.ok(text.includes(rCluster.get('label')), 'cluster label is still shown');
        assert.equal(text.match(new RegExp(blockText, 'gi')).length, rCluster.get('numItems'));

        const yieldIndexToClick = Math.floor(rCluster.get('numItems') / 2);
        this.$('.test-block')
          .eq(yieldIndexToClick)
          .triggerHandler('click');
        assert.ok(blockSpy.calledOnce);
        assert.deepEqual(
          blockSpy.firstCall.args[0],
          rCluster.get('items').objectAt(yieldIndexToClick)
        );
        assert.equal(blockSpy.firstCall.args[1], yieldIndexToClick);

        this.$('.record-cluster__body')
          .children()
          .last()
          .triggerHandler('click');
        return wait();
      })
      .then(() => {
        assert.ok(this.$('.record-cluster__body').length, 'clicking on body does NOT close');
        assert.ok(this.$('.record-cluster__item').length);
        assert.ok(this.$('.record-cluster__body').length);
        assert.ok(this.$('.record-cluster__trigger').length);

        Ember.$('#ember-testing')
          .first()
          .triggerHandler('click');
        return wait();
      })
      .then(() => {
        assert.ok(this.$('.record-cluster__body').length, 'clicking outside does NOT close');
        assert.ok(this.$('.record-cluster__item').length);
        assert.ok(this.$('.record-cluster__body').length);
        assert.ok(this.$('.record-cluster__trigger').length);

        this.$('.record-cluster__trigger')
          .first()
          .triggerHandler('click');
        return wait();
      })
      .then(() => {
        assert.notOk(
          this.$('.record-cluster__body').length,
          'cluster is closed after selecting explicit close button'
        );
        assert.notOk(this.$('.record-cluster__item').length, 'no items shown');
        assert.notOk(this.$('.record-cluster__body').length);
        assert.ok(this.$('.record-cluster__trigger').length);

        done();
      });
  });
});
