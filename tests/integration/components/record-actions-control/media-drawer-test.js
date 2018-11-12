import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaImage, mockValidMediaAudio } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, run } = Ember;

moduleForComponent(
  'record-actions-control/media-drawer',
  'Integration | Component | record actions control/media drawer',
  {
    integration: true,
    beforeEach() {
      this.inject.service('store');
    }
  }
);

test('inputs', function(assert) {
  this.render(hbs`{{record-actions-control/media-drawer}}`);

  assert.ok(this.$('.ember-view').length, 'no inputs is valid');

  run(() => {
    this.setProperties({
      audio: [mockValidMediaAudio(this.store)],
      images: [mockValidMediaImage(this.store)],
      func: () => null
    });
  });

  this.render(hbs`
    {{record-actions-control/media-drawer audio=audio
      images=images
      doRegister=func
      onAddAudio=func
      onRemoveMedia=func}}
  `);

  assert.ok(this.$('.ember-view').length, 'valid inputs');

  this.set('invalidMedia', ['not a MediaImage']);
  assert.throws(() => {
    this.render(hbs`
      {{record-actions-control/media-drawer images=invalidMedia
        audio=invalidMedia
        doRegister=88
        onAddAudio=88
        onRemoveMedia=88}}
    `);
  }, 'images must be an array of MediaImages');
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
  const images = [],
    audio = [],
    done = assert.async();

  this.setProperties({ images, audio });
  this.render(hbs`{{record-actions-control/media-drawer audio=audio images=images}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(
    this.$('.record-actions-control__media-drawer').length,
    'drawer not shown when no media'
  );

  run(() => audio.pushObject(mockValidMediaAudio(this.store)));
  wait()
    .then(() => {
      assert.equal(
        this.$('.record-actions-control__media-drawer').length,
        1,
        'drawer shown when at least one media'
      );
      assert.notOk(this.$('.photo-control').length);

      run(() => images.pushObject(mockValidMediaImage(this.store)));
      return wait();
    })
    .then(() => {
      assert.equal(this.$('.record-actions-control__media-drawer').length, 2);
      assert.ok(
        this.$('.photo-control').length,
        'needs to be photo-control because photo-control also cancels the remove action to prevent opening the gallery'
      );

      done();
    });
});

test('trigger removing media', function(assert) {
  const audio = [mockValidMediaAudio(this.store)],
    images = [mockValidMediaImage(this.store)],
    onRemoveMedia = sinon.spy(),
    done = assert.async();

  this.setProperties({ images, audio, onRemoveMedia });
  this.render(
    hbs`{{record-actions-control/media-drawer audio=audio images=images onRemoveMedia=onRemoveMedia}}`
  );

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.ok(this.$('.record-actions-control__media-drawer').length, 'drawer is open');
  assert.ok(this.$('.photo-control__remove').length);

  this.$('.photo-control__remove')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(onRemoveMedia.calledOnce);
      assert.equal(onRemoveMedia.firstCall.args[0].constructor.modelName, 'media-element');
      assert.equal(onRemoveMedia.firstCall.args[1], 0);
      assert.ok(this.$('.record-actions-control__media-drawer').length, 'drawer is still open');

      assert.ok(
        this.$('.record-actions-control__media-drawer--audio button:not(.audio-control__button)')
          .length
      );
      this.$('.record-actions-control__media-drawer--audio button:not(.audio-control__button)')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onRemoveMedia.calledTwice);
      assert.equal(onRemoveMedia.secondCall.args[0].constructor.modelName, 'media-element');
      assert.equal(onRemoveMedia.secondCall.args[1], 0);
      assert.ok(this.$('.record-actions-control__media-drawer').length, 'drawer is still open');

      done();
    });
});

test('registering', function(assert) {
  const doRegister = sinon.spy();

  this.setProperties({ doRegister });
  this.render(hbs`{{record-actions-control/media-drawer doRegister=doRegister}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(this.$('.record-actions-control__media-drawer').length, 'closed');

  assert.ok(doRegister.calledOnce);

  const publicAPI = doRegister.firstCall.args[0];
  assert.ok(typeOf(publicAPI), 'object');
  assert.ok(typeOf(publicAPI.actions), 'object');
  assert.ok(typeOf(publicAPI.actions.startAddAudio), 'function');
});

test('adding audio', function(assert) {
  run(() => {
    const doRegister = sinon.spy(),
      onAddAudio = sinon.spy(),
      done = assert.async();

    this.setProperties({ doRegister, onAddAudio });
    this.render(
      hbs`{{record-actions-control/media-drawer doRegister=doRegister onAddAudio=onAddAudio}}`
    );

    assert.ok(this.$('.ember-view').length, 'did render');
    assert.notOk(this.$('.record-actions-control__media-drawer--audio').length, 'closed');
    assert.ok(doRegister.calledOnce);
    assert.ok(onAddAudio.notCalled);

    const publicAPI = doRegister.firstCall.args[0];
    publicAPI.actions.startAddAudio();
    wait().then(() => {
      assert.ok(this.$('.record-actions-control__media-drawer--audio').length, 'open');
      assert.ok(this.$('.audio-control--recording').length);
      assert.ok(this.$('.audio-control--recording > button').length);

      this.$('.audio-control--recording > button')
        .first()
        .triggerHandler('click');
      run.later(() => {
        assert.ok(onAddAudio.notCalled);

        this.$('.audio-control--recording > button')
          .first()
          .triggerHandler('click');
        run.later(() => {
          assert.ok(onAddAudio.calledOnce);
          assert.notOk(this.$('.audio-control--recording').length, 'recording is hidden');

          done();
        }, 500);
      }, 500);
    });
  });
});

test('cancelling adding audio', function(assert) {
  run(() => {
    const doRegister = sinon.spy(),
      onAddAudio = sinon.spy(),
      done = assert.async();

    this.setProperties({ doRegister, onAddAudio });
    this.render(
      hbs`{{record-actions-control/media-drawer doRegister=doRegister onAddAudio=onAddAudio}}`
    );

    assert.ok(this.$('.ember-view').length, 'did render');
    assert.notOk(this.$('.record-actions-control__media-drawer--audio').length, 'closed');
    assert.ok(doRegister.calledOnce);
    assert.ok(onAddAudio.notCalled);

    const publicAPI = doRegister.firstCall.args[0];
    publicAPI.actions.startAddAudio();
    wait()
      .then(() => {
        assert.ok(this.$('.record-actions-control__media-drawer--audio').length, 'open');
        assert.ok(this.$('.audio-control--recording').length);
        assert.ok(this.$('.audio-control--recording + button').length, 'button to cancel add');

        this.$('.audio-control--recording + button')
          .first()
          .triggerHandler('click');
        return wait();
      })
      .then(() => {
        assert.ok(doRegister.calledOnce);
        assert.ok(onAddAudio.notCalled);

        assert.notOk(this.$('.record-actions-control__media-drawer--audio').length, 'closed');
        assert.notOk(this.$('.audio-control--recording').length);

        done();
      });
  });
});
