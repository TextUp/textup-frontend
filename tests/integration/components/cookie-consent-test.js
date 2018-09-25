import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import LocaleUtils from 'textup-frontend/utils/locale';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('cookie-consent', 'Integration | Component | cookie consent', {
  integration: true
});

test('rendering', function(assert) {
  const countryCodeStub = sinon.stub(LocaleUtils, 'getCountryCode'),
    done = assert.async();

  this.render(hbs`{{cookie-consent}}`);

  wait()
    .then(() => {
      assert.ok(Ember.$('.cc-theme-cookie-consent').length, 'did render');
      assert.notOk(
        this.$('.cc-theme-cookie-consent').length,
        'rendered at the top level, not within the confines of the component'
      );
      assert.ok(Ember.$('.cc-theme-cookie-consent a').attr('href'), 'has default link');
      assert.ok(countryCodeStub.calledOnce);

      this.setProperties({
        theme: 'testing',
        learnMoreLink: `http://www.example.com/${Math.random()}`
      });
      this.render(hbs`{{cookie-consent theme=theme learnMoreLink=learnMoreLink}}`);
      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.cc-theme-testing').length, 'did render');
      assert.notOk(
        this.$('.cc-theme-testing').length,
        'rendered at the top level, not within the confines of the component'
      );
      assert.equal(
        Ember.$('.cc-theme-testing a').attr('href'),
        this.get('learnMoreLink'),
        'appropriate link is rendered'
      );
      assert.ok(countryCodeStub.calledTwice);

      countryCodeStub.restore();
      done();
    });
});
