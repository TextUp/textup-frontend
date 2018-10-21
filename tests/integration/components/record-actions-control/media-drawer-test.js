import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent(
  'record-actions-control/media-drawer',
  'Integration | Component | record actions control/media drawer',
  {
    integration: true
  }
);

test('inputs', function(assert) {
  this.render(hbs`{{record-actions-control/media-drawer}}`);

  assert.ok(this.$('.ember-view').length, 'no inputs is valid');

  this.setProperties({
    images: [],
    onRemoveImage: () => null
  });

  this.render(
    hbs`{{record-actions-control/media-drawer images=images onRemoveImage=onRemoveImage}}`
  );

  assert.ok(this.$('.ember-view').length, 'valid inputs');

  this.set('invalidImages', ['not a MediaImage']);
  assert.throws(
    () => this.render(hbs`{{record-actions-control/media-drawer images=invalidImages}}`),
    'images must be an array of MediaImages'
  );
});

test('render block', function(assert) {
  const blockText = `${Math.random()}`;
  this.setProperties({ blockText });

  this.render(hbs`
    {{#record-actions-control/media-drawer}}
      {{blockText}}
    {{/record-actions-control/media-drawer}}
  `);

  const text = this.$().text();
  assert.ok(text.includes(blockText));
});

test('displaying media', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    images = [],
    done = assert.async();

  this.setProperties({ images });
  this.render(hbs`{{record-actions-control/media-drawer images=images}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(
    this.$('.record-actions-control__media-drawer').length,
    'drawer not shown when no images'
  );
  run(() => images.pushObject(mockValidMediaImage(store)));
  wait().then(() => {
    assert.ok(
      this.$('.record-actions-control__media-drawer').length,
      'drawer shown when at least one image'
    );
    assert.ok(
      this.$('.photo-control').length,
      'needs to be photo-control because photo-control also cancels the remove action to prevent opening the gallery'
    );

    done();
  });
});

test('trigger removing media', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    images = [mockValidMediaImage(store)],
    onRemoveImage = sinon.spy(),
    done = assert.async();

  this.setProperties({ images, onRemoveImage });
  this.render(
    hbs`{{record-actions-control/media-drawer images=images onRemoveImage=onRemoveImage}}`
  );

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.ok(this.$('.record-actions-control__media-drawer').length, 'drawer is open');
  assert.ok(this.$('.photo-control__remove').length);

  this.$('.photo-control__remove')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onRemoveImage.calledOnce);
    assert.ok(this.$('.record-actions-control__media-drawer').length, 'drawer is still open');

    done();
  });
});
