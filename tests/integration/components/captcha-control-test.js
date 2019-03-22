import hbs from 'htmlbars-inline-precompile';
import ReCaptcha from 'ember-g-recaptcha/components/g-recaptcha';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

// For import, see: https://github.com/algonauti/ember-g-recaptcha/blob/v0.4.0/app/components/g-recaptcha.js

let grecaptcha;

moduleForComponent('captcha-control', 'Integration | Component | captcha control', {
  integration: true,
  beforeEach() {
    grecaptcha = sinon.stub(window, 'grecaptcha').value({ render: sinon.spy() });
  },
  afterEach() {
    wait().then(() => grecaptcha.restore());
  },
});

test('inputs', function(assert) {
  this.setProperties({ fn: () => null });

  assert.throws(() =>
    this.render(hbs`{{captcha-control onSuccess=123 onFailure=123 onExpiration=123}}`)
  );

  this.render(hbs`{{captcha-control onSuccess=fn onFailure=fn onExpiration=fn}}`);
  assert.ok(this.$('.captcha-control').length, 'did render');
});

test('callbacks', function(assert) {
  const onSuccess = sinon.spy(),
    onFailure = sinon.spy(),
    onExpiration = sinon.spy(),
    captchaService = Ember.getOwner(this).lookup('service:captcha-service'),
    isValid = sinon.stub(captchaService, 'isValid'),
    done = assert.async();
  this.setProperties({ onSuccess, onFailure, onExpiration });

  this.render(
    hbs`{{captcha-control onSuccess=onSuccess onFailure=onFailure onExpiration=onExpiration}}`
  );
  assert.ok(this.$('.captcha-control').length, 'did render');

  let captchaParams;
  wait()
    .then(() => {
      assert.ok(window.grecaptcha.render.called);
      captchaParams = window.grecaptcha.render.args[0][1];

      assert.ok(onSuccess.notCalled);
      assert.ok(onFailure.notCalled);
      assert.ok(onExpiration.notCalled);

      isValid.resolves();
      captchaParams.callback();
      return wait();
    })
    .then(() => {
      assert.ok(onSuccess.calledOnce);
      assert.ok(onFailure.notCalled);
      assert.ok(onExpiration.notCalled);

      isValid.rejects();
      captchaParams.callback();
      return wait();
    })
    .then(() => {
      assert.ok(onSuccess.calledOnce);
      assert.ok(onFailure.calledOnce);
      assert.ok(onExpiration.notCalled);

      captchaParams['expired-callback']();
      return wait();
    })
    .then(() => {
      assert.ok(onSuccess.calledOnce);
      assert.ok(onFailure.calledOnce);
      assert.ok(onExpiration.calledOnce);

      isValid.restore();
      done();
    });
});
