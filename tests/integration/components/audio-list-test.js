import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';
import { mockValidMediaAudio, mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('audio-list', 'Integration | Component | audio list', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  }
});

test('properties', function(assert) {
  this.setProperties({ audioArray: [mockValidMediaAudio(this.store)] });

  this.render(hbs`{{audio-list}}`);

  assert.ok(this.$('.ember-view').length);

  this.render(hbs`
    {{audio-list audio=audioArray
        maxNumToDisplay=88
        sortPropName="validPropName"
        sortLowToHigh=true}}
  `);

  assert.ok(this.$('.ember-view').length);

  assert.throws(() => {
    this.render(hbs`{{audio-list
      audio="not an array"
      maxNumToDisplay="hi"
      sortPropName=88
      sortLowToHigh=88}}
    `);
  });
});

test('ignores non-audio media elements', function(assert) {
  run(() => {
    const imageEl1 = mockValidMediaImage(this.store),
      imageEl2 = mockValidMediaImage(this.store),
      audioEl1 = mockValidMediaAudio(this.store),
      audioEl2 = mockValidMediaAudio(this.store),
      emptyEl = this.store.createFragment('media-element');
    this.setProperties({
      onlyAudio: [audioEl1, audioEl2],
      onlyImages: [imageEl1, imageEl2],
      onlyEmpty: [emptyEl],
      allTypes: [imageEl1, imageEl2, audioEl1, audioEl2, emptyEl]
    });

    this.render(hbs`{{audio-list}}`);

    assert.ok(this.$('.ember-view').length);
    assert.notOk(this.$('.audio-control').length);

    this.render(hbs`{{audio-list audio=onlyAudio}}`);

    assert.ok(this.$('.ember-view').length);
    assert.equal(this.$('.audio-control').length, this.get('onlyAudio.length'));

    this.render(hbs`{{audio-list audio=onlyImages}}`);

    assert.ok(this.$('.ember-view').length);
    assert.notOk(this.$('.audio-control').length);

    this.render(hbs`{{audio-list audio=onlyEmpty}}`);

    assert.ok(this.$('.ember-view').length);
    assert.notOk(this.$('.audio-control').length);

    this.render(hbs`{{audio-list audio=allTypes itemClass="testing-item-class"}}`);

    assert.ok(this.$('.ember-view').length);
    assert.equal(this.$('.audio-control').length, this.get('onlyAudio.length'));
    assert.equal(this.$('.testing-item-class').length, this.get('onlyAudio.length'));
  });
});

test('rendering block + inverse', function(assert) {
  const nestedClass = 'audio-list-test',
    audioEl1 = mockValidMediaAudio(this.store),
    audioEl2 = mockValidMediaAudio(this.store),
    uid1 = audioEl1.get(MEDIA_ID_PROP_NAME),
    uid2 = audioEl2.get(MEDIA_ID_PROP_NAME),
    inverseBlockText = `${Math.random()}`;
  this.setProperties({ audio: [audioEl1, audioEl2], nestedClass, inverseBlockText });

  this.render(hbs`{{audio-list audio=audio}}`);

  assert.ok(this.$('.ember-view').length);
  assert.equal(this.$('.audio-control').length, this.get('audio.length'));
  assert.notOk(this.$(`.${nestedClass}`).length);

  this.render(hbs`
      {{#audio-list audio=audio as |el|}}
        <span class="{{nestedClass}}">{{el.uid}}</span>
      {{else}}
        {{inverseBlockText}}
      {{/audio-list}}
    `);

  assert.ok(this.$('.ember-view').length);
  assert.equal(this.$('.audio-control').length, this.get('audio.length'));
  assert.equal(this.$(`.${nestedClass}`).length, this.get('audio.length'));
  const text = this.$().text();
  assert.ok(text.indexOf(uid1) > -1);
  assert.ok(text.indexOf(uid2) > -1);
  assert.ok(text.indexOf(inverseBlockText) > -1);
});

test('listing audio items in a certain order + specifying max num to show', function(assert) {
  run(() => {
    const time1 = new Date(Date.now()),
      time2 = new Date(Date.now() + 1000),
      nestedClass = 'audio-list-test',
      audioEl1 = mockValidMediaAudio(this.store),
      audioEl2 = mockValidMediaAudio(this.store);
    audioEl1.set('whenCreated', time1);
    audioEl2.set('whenCreated', time2);
    this.setProperties({ audio: [audioEl2, audioEl1], nestedClass });

    this.render(hbs`
      {{#audio-list audio=audio as |el|}}
        <span class={{nestedClass}}>{{el.uid}}</span>
      {{/audio-list}}
    `);

    assert.ok(this.$('.ember-view').length);
    assert.equal(this.$('.audio-control').length, this.get('audio.length'));
    assert.equal(this.$(`.${nestedClass}`).length, this.get('audio.length'));

    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(0)
        .text(),
      audioEl2.get(MEDIA_ID_PROP_NAME),
      'no sort key specified = use passed-in order'
    );
    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(1)
        .text(),
      audioEl1.get(MEDIA_ID_PROP_NAME),
      'no sort key specified = use passed-in order'
    );

    this.render(hbs`
      {{#audio-list audio=audio sortPropName="whenCreated" as |el|}}
        <span class={{nestedClass}}>{{el.uid}}</span>
      {{/audio-list}}
    `);

    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(0)
        .text(),
      audioEl1.get(MEDIA_ID_PROP_NAME)
    );
    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(1)
        .text(),
      audioEl2.get(MEDIA_ID_PROP_NAME)
    );

    this.render(hbs`
      {{#audio-list audio=audio sortPropName="whenCreated" sortLowToHigh=false as |el|}}
        <span class={{nestedClass}}>{{el.uid}}</span>
      {{/audio-list}}
    `);

    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(0)
        .text(),
      audioEl2.get(MEDIA_ID_PROP_NAME)
    );
    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(1)
        .text(),
      audioEl1.get(MEDIA_ID_PROP_NAME)
    );

    this.render(hbs`
      {{#audio-list audio=audio sortPropName="whenCreated" maxNumToDisplay=1 as |el|}}
        <span class={{nestedClass}}>{{el.uid}}</span>
      {{/audio-list}}
    `);

    assert.equal(this.$('.audio-control').length, 1);
    assert.equal(this.$(`.${nestedClass}`).length, 1);
    assert.equal(
      this.$(`.${nestedClass}`)
        .eq(0)
        .text(),
      audioEl1.get(MEDIA_ID_PROP_NAME)
    );
  });
});
