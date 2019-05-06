import * as SplashScreenService from 'textup-frontend/services/splash-screen-service';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('', 'Integration | Service | splash screen service', {
  integration: true,
  beforeEach() {
    this.register('service:splashScreenService', SplashScreenService.default);
    this.inject.service('splashScreenService');
  },
});

test('try removing splash screen element from DOM', function(assert) {
  const done = assert.async();

  assert.equal(this.splashScreenService.get('hasSplashScreen'), true);

  this.splashScreenService.tryRemove();

  assert.equal(
    this.splashScreenService.get('hasSplashScreen'),
    true,
    'still in DOM because could not find'
  );

  this.setProperties({ splashId: SplashScreenService.SPLASH_SCREEN_ID });
  this.render(hbs`<div id={{splashId}}></div>`);
  assert.ok(Ember.$('#' + SplashScreenService.SPLASH_SCREEN_ID).length, 'has splash screen');

  this.splashScreenService.tryRemove();
  setTimeout(() => {
    assert.equal(this.splashScreenService.get('hasSplashScreen'), false);
    assert.notOk(
      Ember.$('#' + SplashScreenService.SPLASH_SCREEN_ID).length,
      'splash screen removed'
    );

    done();
  }, 500);
});
