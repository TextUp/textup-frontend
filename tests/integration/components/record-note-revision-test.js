import * as LocationUtils from 'textup-frontend/utils/location';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;
let store;

moduleForComponent('record-note-revision', 'Integration | Component | record note revision', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  }
});

test('inputs', function(assert) {
  run(() => {
    const invalidRevision = {},
      validRevision = store.createRecord('record-note-revision');
    this.setProperties({ invalidRevision, validRevision });

    assert.throws(() => this.render(hbs`{{record-note-revision}}`), 'requires revision');

    this.render(hbs`{{record-note-revision revision=validRevision}}`);

    assert.ok(this.$('.record-note-revision').length, 'did render');

    assert.throws(
      () => this.render(hbs`{{record-note-revision revision=invalidRevision}}`),
      'requires revision to be a RecordNoteRevision'
    );
  });
});

test('rendering block', function(assert) {
  run(() => {
    const blockText = `${Math.random()}`,
      validRevision = store.createRecord('record-note-revision');
    this.setProperties({ blockText, validRevision });

    this.render(hbs`
    {{#record-note-revision revision=validRevision}}
      {{blockText}}
    {{/record-note-revision}}
  `);

    assert.ok(this.$('.record-note-revision').length, 'did render');
    const text = this.$().text();
    assert.ok(text.includes(blockText), 'block contents did render');
  });
});

test('rendering with only note', function(assert) {
  run(() => {
    const noteContents = `${Math.random()}`,
      validRevision = store.createRecord('record-note-revision', { noteContents });
    this.setProperties({ validRevision });

    this.render(hbs`{{record-note-revision revision=validRevision}}`);

    assert.ok(this.$('.record-note-revision').length, 'did render');
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.location-preview').length, 'no location');
    const text = this.$().text();
    assert.ok(text.includes(noteContents), 'block contents did render');
  });
});

test('rendering with location and media', function(assert) {
  run(() => {
    const validRevision = store.createRecord('record-note-revision', {
        media: store.createRecord('media', { images: [mockValidMediaImage(store)] }),
        location: store.createRecord('location', { latLng: { lat: 0, lng: 0 } })
      }),
      buildUrlStub = sinon
        .stub(LocationUtils, 'buildPreviewUrl')
        .callsFake(() => 'https://via.placeholder.com/5x5');
    this.setProperties({ validRevision });

    this.render(hbs`{{record-note-revision revision=validRevision}}`);

    assert.ok(this.$('.record-note-revision').length, 'did render');
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.ok(this.$('.image-stack').length, 'has images');
    assert.ok(this.$('.location-preview').length, 'has location');

    buildUrlStub.restore();
  });
});
