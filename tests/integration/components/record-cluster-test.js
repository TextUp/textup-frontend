import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { run } = Ember;
let store;

moduleForComponent('record-cluster', 'Integration | Component | record cluster', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  }
});

test('inputs', function(assert) {
  const rCluster = RecordCluster.create();
  this.setProperties({ rCluster });

  assert.throws(() => this.render(hbs`{{record-cluster}}`), 'requires cluster');

  this.render(hbs`{{record-cluster cluster=rCluster}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
});

test('rendering empty cluster', function(assert) {
  const rCluster = RecordCluster.create();
  this.setProperties({ rCluster });

  this.render(hbs`{{record-cluster cluster=rCluster}}`);

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

test('rendering cluster of one', function(assert) {
  run(() => {
    const rCluster = RecordCluster.create({ items: [store.createRecord('record-item')] });
    this.setProperties({ rCluster });

    this.render(hbs`{{record-cluster cluster=rCluster}}`);

    assert.notOk(this.$('.record-cluster').length, 'no cluster');
    assert.ok(this.$('.record-cluster__item').length, 'has cluster item');
  });
});

test('rendering cluster of several + opening and closing', function(assert) {
  run(() => {
    const rCluster = RecordCluster.create({
        label: `${Math.random()}`,
        items: Array(8)
          .fill()
          .map(() => store.createRecord('record-item'))
      }),
      done = assert.async();
    this.setProperties({ rCluster });

    this.render(hbs`{{record-cluster cluster=rCluster}}`);

    assert.ok(this.$('.record-cluster').length, 'has cluster');
    assert.notOk(this.$('.hide-away-body').length, 'cluster starts out closed');
    assert.notOk(this.$('.record-cluster__item').length, 'no items shown');
    assert.notOk(this.$('.record-cluster__body').length);
    assert.equal(this.$('.record-cluster__trigger').length, 1, 'has OPEN trigger');

    let text = this.$().text();
    assert.ok(text.includes(rCluster.get('label')), 'cluster label is shown');

    this.$('.hide-away-trigger')
      .first()
      .triggerHandler('mousedown');

    // wait for hide-away to fully open and attach `afterOpen` listeners
    Ember.run.later(() => {
      assert.ok(this.$('.hide-away-body').length, 'cluster is open');
      assert.ok(this.$('.record-cluster__item').length, 'items are shown when cluster is open');
      assert.ok(this.$('.record-cluster__body').length);
      assert.equal(
        this.$('.record-cluster__trigger').length,
        2,
        'TWO triggers because close also has one to explicitly close'
      );

      text = this.$().text();
      assert.ok(text.includes(rCluster.get('label')), 'cluster label is still shown');

      this.$('.hide-away-body')
        .children()
        .last()
        .triggerHandler('click');
      // wait doesn't wait long enough
      Ember.run.later(() => {
        assert.ok(this.$('.hide-away-body').length, 'clicking on body does NOT close');
        assert.ok(this.$('.record-cluster__item').length);
        assert.ok(this.$('.record-cluster__body').length);
        assert.equal(this.$('.record-cluster__trigger').length, 2);

        Ember.$('#ember-testing')
          .first()
          .triggerHandler('click');
        // wait doesn't wait long enough
        Ember.run.later(() => {
          assert.ok(this.$('.hide-away-body').length, 'clicking outside does NOT close');
          assert.ok(this.$('.record-cluster__item').length);
          assert.ok(this.$('.record-cluster__body').length);
          assert.equal(this.$('.record-cluster__trigger').length, 2);

          this.$('.record-cluster__trigger')
            .eq(1)
            .triggerHandler('click');
          // closing and re-showing trigger is very slow, so need to wait a whole second
          Ember.run.later(() => {
            assert.notOk(
              this.$('.hide-away-body').length,
              'cluster is closed after selecting explicit close button'
            );
            assert.notOk(this.$('.record-cluster__item').length, 'no items shown');
            assert.notOk(this.$('.record-cluster__body').length);
            assert.equal(this.$('.record-cluster__trigger').length, 1, 'still has OPEN trigger');

            done();
          }, 1000);
        }, 500);
      }, 500);
    }, 500);
  });
});
