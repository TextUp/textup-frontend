import $ from 'jquery';
import config from 'textup-frontend/config/environment';
import hbs from 'htmlbars-inline-precompile';
import InterceptInappbrowserInitializer from 'textup-frontend/initializers/intercept-inappbrowser';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('', 'Integration | Initializer | intercept inappbrowser', {
  integration: true,
});

test('overrides window.open', function(assert) {
  const done = assert.async(),
    originalOpen = window.open,
    originalCordova = window.cordova,
    open = sinon.stub(),
    hasCordova = sinon.stub(config, 'hasCordova').get(() => true);
  window.cordova = { InAppBrowser: { open } };

  InterceptInappbrowserInitializer.initialize();
  $(document).trigger($.Event('deviceready'));

  wait().then(() => {
    assert.deepEqual(window.open, open);

    window.open = originalOpen;
    window.cordova = originalCordova;
    hasCordova.restore();
    $(document).off();
    done();
  });
});

test('intercepts clicks', function(assert) {
  const done = assert.async(),
    originalOpen = window.open,
    originalCordova = window.cordova,
    open = sinon.stub(),
    src = 'https://uniquestring.com/',
    hasCordova = sinon.stub(config, 'hasCordova').get(() => true);
  window.cordova = { InAppBrowser: { open } };

  InterceptInappbrowserInitializer.initialize();
  this.setProperties({ src });
  this.render(hbs`<a href={{src}} target="_blank" id="test-link"> Testing link </a>}`);
  $(document).trigger($.Event('deviceready'));
  wait()
    .then(() => {
      this.$('#test-link').click();
      return wait();
    })
    .then(() => {
      assert.ok(open.calledOnce);
      assert.equal(open.firstCall.args[0], src);

      window.open = originalOpen;
      window.cordova = originalCordova;
      hasCordova.restore();
      $(document).off();
      done();
    });
});
