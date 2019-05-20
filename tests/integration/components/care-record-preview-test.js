import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

moduleForComponent('care-record-preview', 'Integration | Component | care record preview', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  },
});

test('inputs', function(assert) {
  this.setProperties({ func: () => null, array: [] });

  this.render(hbs`{{care-record-preview}}`);
  assert.ok(this.$('.care-record-preview').length, 'did render');

  this.render(
    hbs`{{care-record-preview name="hi" noItemsMessage="hi" recordClusters=array onOpen=func}}`
  );
  assert.ok(this.$('.care-record-preview').length, 'did render');
});

test('opening up record owner', function(assert) {
  const onOpen = sinon.spy(),
    done = assert.async();
  this.setProperties({ onOpen });

  this.render(hbs`{{care-record-preview}}`);
  assert.ok(this.$('.care-record-preview').length, 'did render');
  assert.notOk(this.$('.care-record-preview__button').length, 'no button to open in app');

  this.render(hbs`{{care-record-preview onOpen=onOpen}}`);
  assert.ok(this.$('.care-record-preview').length, 'did render');
  assert.ok(this.$('.care-record-preview__button').length, 'has button to open in app');

  this.$('.care-record-preview__button')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onOpen.calledOnce);
    done();
  });
});

test('displaying name', function(assert) {
  const name = `${Math.random()}`;
  this.setProperties({ name });

  this.render(hbs`{{care-record-preview name=name}}`);
  assert.ok(this.$('.care-record-preview').length, 'did render');
  assert.ok(
    this.$()
      .text()
      .indexOf(name) > -1
  );
});

test('displaying record item', function(assert) {
  run(() => {
    const noItemsMessage = `${Math.random()}`,
      emptyArray = [],
      rCluster = RecordCluster.create({ items: [this.store.createRecord('record-item')] });
    this.setProperties({ noItemsMessage, emptyArray, clusters: [rCluster] });

    this.render(
      hbs`{{care-record-preview noItemsMessage=noItemsMessage recordClusters=emptyArray}}`
    );
    assert.ok(this.$('.care-record-preview').length, 'did render');
    assert.ok(
      this.$()
        .text()
        .indexOf(noItemsMessage) > -1,
      'displays no item message'
    );
    assert.notOk(this.$('.record-cluster__item').length, 'no record items');

    this.render(hbs`{{care-record-preview noItemsMessage=noItemsMessage recordClusters=clusters}}`);
    assert.ok(this.$('.care-record-preview').length, 'did render');
    assert.ok(
      this.$()
        .text()
        .indexOf(noItemsMessage) === -1,
      'hidden no item message'
    );
    assert.ok(this.$('.record-cluster__item').length, 'has record item');
  });
});
