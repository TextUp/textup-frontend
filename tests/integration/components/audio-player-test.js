import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { VALID_MP3_URL_1, VALID_MP3_URL_2 } from 'textup-frontend/tests/helpers/utilities';

const { run } = Ember;

let el1, el2;

moduleForComponent('audio-player', 'Integration | Component | audio player', {
  integration: true,
  beforeEach() {
    const store = Ember.getOwner(this).lookup('service:store');
    el1 = store.createFragment('mediaElement');
    el2 = store.createFragment('mediaElement');
    el1.addVersion('audio/mpeg', VALID_MP3_URL_1);
    el2.addVersion('audio/mpeg', VALID_MP3_URL_2);
  }
});

test('properties + rendering message and sources', function(assert) {
  const message = `${Math.random()}`;
  this.setProperties({ el1, message });

  this.render(hbs`{{audio-player}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.equal(this.$('.audio-control').children().length, 0, 'is empty because no audio source');

  this.render(hbs`{{audio-player audio=el1 disabled=false message=message}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control').children().length > 0);
  assert.ok(this.$('audio source').length);
  assert.equal(this.$('audio source').attr('src'), el1.get('versions.firstObject.source'));
  assert.equal(this.$('audio source').attr('type'), el1.get('versions.firstObject.type'));
  assert.ok(
    this.$()
      .text()
      .indexOf(message) > -1
  );

  assert.throws(() => {
    this.render(hbs`{{audio-player audio=false disabled="a string" message=true}}`);
  });
});

test('disabled', function(assert) {
  this.setProperties({ el1 });

  this.render(hbs`{{audio-player audio=el1 disabled=true}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control').children().length);
  assert.ok(this.$('.audio-control--disabled').length);
  assert.ok(this.$('button:disabled').length);
});

test('playing and pausing', function(assert) {
  const done = assert.async();

  this.setProperties({ el1 });

  this.render(hbs`{{audio-player audio=el1}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control').children().length);
  assert.notOk(this.$('.audio-control--disabled').length);
  assert.notOk(this.$('button:disabled').length);
  assert.notOk(this.$('button.audio-control__button--active').length);

  this.$('button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(this.$('button.audio-control__button--active').length);

    run.later(() => {
      this.$('button')
        .first()
        .triggerHandler('click');
      wait().then(() => {
        assert.notOk(this.$('button.audio-control__button--active').length);

        done();
      });
    }, 500);
  });
});

test('switching sources dynamically', function(assert) {
  const done = assert.async(),
    onLoadStartSpy = sinon.spy();

  this.setProperties({ audio: el1 });
  this.render(hbs`{{audio-player audio=audio}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control').children().length);
  assert.ok(this.$('audio').length);

  // after we bind this we've already missed the first loadstart event
  this.$('audio').on('loadstart', onLoadStartSpy);

  this.setProperties({ audio: el2 });
  wait()
    .then(() => {
      assert.ok(onLoadStartSpy.calledOnce);

      this.setProperties({ audio: el1 });
      return wait();
    })
    .then(() => {
      assert.ok(onLoadStartSpy.calledTwice);

      done();
    });
});
