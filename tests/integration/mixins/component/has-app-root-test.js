import Component from '@ember/component';
import Ember from 'ember';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import hbs from 'htmlbars-inline-precompile';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';

const componentIdent = 'component:has-app-root-test-component';

moduleForComponent('', 'Integration | Mixin | component/has app root', {
  integration: true,
  beforeEach() {
    this.register(componentIdent, Component.extend(HasAppRoot));
  },
});

test('getting app root when not testing', function(assert) {
  const owner = getOwner(this),
    app = owner.lookup('application:main'),
    appRootId = 'testing-app-root',
    originalRootElement = app.get('rootElement'),
    oldTestingVal = Ember.testing;
  app.set('rootElement', `#${appRootId}`);

  this.setProperties({ appRootId });
  this.render(hbs`<div id={{appRootId}}></div>`);

  Ember.testing = false;
  const obj = owner.factoryFor(componentIdent).create();

  assert.equal(obj.get('_root').attr('id'), appRootId);
  assert.equal(obj.get('_root').length, 1);

  Ember.testing = oldTestingVal;
  app.set('rootElement', originalRootElement);
});

test('getting app root when testing', function(assert) {
  const oldTestingVal = Ember.testing;

  Ember.testing = true;
  const obj = getOwner(this)
    .factoryFor(componentIdent)
    .create();

  assert.equal(obj.get('_root').attr('id'), 'ember-testing');
  assert.equal(obj.get('_root').length, 1);

  Ember.testing = oldTestingVal;
});
