import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaImage, mockValidMediaAudio } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('future-message', 'Integration | Component | future message', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  },
});

test('inputs', function(assert) {
  run(() => {
    assert.throws(() => this.render(hbs`{{future-message}}`));

    const fMsg = this.store.createRecord('future-message');
    this.setProperties({ fMsg });
    this.render(hbs`{{future-message message=fMsg}}`);

    assert.ok(this.$('.ember-view').length);

    assert.throws(() => this.render(hbs`{{future-message message="not a future message"}}`));
  });
});

test('rendering block', function(assert) {
  run(() => {
    const fMsg = this.store.createRecord('future-message'),
      blockText = `${Math.random()}`;
    this.setProperties({ fMsg, blockText });
    this.render(hbs`{{#future-message message=fMsg}}{{blockText}}{{/future-message}}`);

    assert.ok(this.$('.ember-view').length);
    assert.ok(
      this.$()
        .text()
        .indexOf(blockText) > -1
    );
  });
});

test('rendering type of message', function(assert) {
  run(() => {
    const done = assert.async(),
      fMsg = this.store.createRecord('future-message', {
        type: Constants.FUTURE_MESSAGE.TYPE.TEXT,
      });
    this.setProperties({ fMsg });
    this.render(hbs`{{future-message message=fMsg}}`);

    assert.ok(this.$('.ember-view').length);
    assert.ok(this.$('.fa-paper-plane-o').length, 'has text icon');

    fMsg.set('type', Constants.FUTURE_MESSAGE.TYPE.CALL);

    wait().then(() => {
      assert.ok(this.$('.fa-phone').length, 'has call icon');

      done();
    });
  });
});

test('rendering completion status', function(assert) {
  run(() => {
    const done = assert.async(),
      fMsg = this.store.createRecord('future-message', { isDone: true, isRepeating: false });
    this.setProperties({ fMsg });
    this.render(hbs`{{future-message message=fMsg}}`);

    assert.ok(this.$('.ember-view').length);
    assert.ok(
      this.$()
        .text()
        .toLowerCase()
        .indexOf('done') > -1
    );

    fMsg.setProperties({ isDone: false, isRepeating: false });

    wait()
      .then(() => {
        let text = this.$()
          .text()
          .toLowerCase();
        assert.ok(text.indexOf('done') === -1);
        assert.ok(text.indexOf('stop') === -1);
        assert.ok(text.indexOf('created') > -1);

        fMsg.setProperties({ isDone: false, isRepeating: true });
        return wait();
      })
      .then(() => {
        let text = this.$()
          .text()
          .toLowerCase();
        assert.ok(text.indexOf('done') === -1);
        assert.ok(text.indexOf('stop') > -1);
        assert.ok(text.indexOf('created') === -1);

        done();
      });
  });
});

test('rendering notify self', function(assert) {
  run(() => {
    const done = assert.async(),
      fMsg = this.store.createRecord('future-message', { notifySelfOnSend: false });
    this.setProperties({ fMsg });
    this.render(hbs`{{future-message message=fMsg}}`);

    assert.ok(this.$('.ember-view').length);
    assert.ok(this.$('.fa-user.fa-inverse').length, 'user icon is greyed out');

    fMsg.set('notifySelfOnSend', true);

    wait().then(() => {
      assert.notOk(this.$('.fa-user.fa-inverse').length, 'user icon is greyed out');
      assert.ok(this.$('.fa-user').length, 'user icon is greyed out');

      done();
    });
  });
});

test('media + content', function(assert) {
  run(() => {
    const done = assert.async(),
      message = `${Math.random()}`,
      fMsg = this.store.createRecord('future-message', { message });
    this.setProperties({ fMsg });
    this.render(hbs`{{future-message message=fMsg}}`);

    assert.ok(this.$('.ember-view').length);
    assert.ok(
      this.$()
        .text()
        .indexOf(message) > -1
    );
    assert.notOk(this.$('.image-stack').length);
    assert.notOk(this.$('.audio-wrapper__player-item').length);

    fMsg.set(
      'media',
      this.store.createRecord('media', {
        images: [mockValidMediaImage(this.store)],
        audio: [mockValidMediaAudio(this.store)],
      })
    );
    wait().then(() => {
      assert.ok(this.$('.ember-view').length);
      assert.ok(
        this.$()
          .text()
          .indexOf(message) > -1
      );
      assert.ok(this.$('.image-stack').length);
      assert.ok(this.$('.audio-wrapper__player-item').length);

      done();
    });
  });
});
