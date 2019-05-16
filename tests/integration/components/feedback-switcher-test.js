import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('feedback-switcher', 'Integration | Component | feedback switcher', {
  integration: true,
});

test('rendering', function(assert) {
  const src = Math.random() + '',
    nativeAppSrc = Math.random() + '',
    text = Math.random() + '';
  this.setProperties({ src, nativeAppSrc, text });
  this.render(hbs`{{feedback-switcher src=src nativeAppSrc=nativeAppSrc text=text}}`);
  assert.ok(this.$('.feedback-switcher').length, 'did render');
});

test('displaying when cordova is active', function(assert) {
  const oldCordova = window.cordova;
  window.cordova = true;

  const src = 'https://www.example.com/' + Math.random(),
    nativeAppSrc = 'https://www.example.com/' + Math.random(),
    text = Math.random() + '';
  this.setProperties({ src, nativeAppSrc, text });
  this.render(hbs`{{feedback-switcher src=src nativeAppSrc=nativeAppSrc text=text}}`);

  assert.equal(this.$('a').prop('href'), nativeAppSrc, 'did render link for native apps');
  window.cordova = oldCordova;
});

test('displaying when cordova not is active', function(assert) {
  const oldCordova = window.cordova;
  window.cordova = false;

  const src = 'https://www.example.com/' + Math.random(),
    nativeAppSrc = 'https://www.example.com/' + Math.random(),
    text = Math.random() + '';
  this.setProperties({ src, nativeAppSrc, text });
  this.render(hbs`{{feedback-switcher src=src nativeAppSrc=nativeAppSrc text=text}}`);

  assert.ok(
    this.$('span')
      .text()
      .trim()
      .includes(text)
  );
  assert.ok(this.$('iframe').length, 'did render iframe');
  assert.equal(this.$('iframe').prop('src'), src, 'did render link for web');
  window.cordova = oldCordova;
});
