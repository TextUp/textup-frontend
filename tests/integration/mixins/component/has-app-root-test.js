import Ember from 'ember';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

const HasAppRootComponent = Ember.Component.extend(HasAppRoot);

moduleForComponent('', 'Integration | Mixin | component/has app root', {
  integration: true
});

test('getting app root when not testing', function(assert) {
  const owner = Ember.getOwner(this),
    app = owner.lookup('application:main'),
    appRootId = 'testing-app-root',
    originalRootElement = app.get('rootElement'),
    testingStatusStub = sinon.stub(Ember, 'testing').get(() => false),
    getOwnerStub = sinon.stub(Ember, 'getOwner').returns(owner);
  app.set('rootElement', `#${appRootId}`);

  this.setProperties({ appRootId });
  this.render(hbs`<div id={{appRootId}}></div>`);

  const obj = HasAppRootComponent.create();

  assert.equal(obj.get('_root').selector, `#${appRootId}`);
  assert.equal(obj.get('_root').length, 1);

  getOwnerStub.restore();
  testingStatusStub.restore();
  app.set('rootElement', originalRootElement);
});

test('getting app root when testing', function(assert) {
  const testingStatusStub = sinon.stub(Ember, 'testing').get(() => true);

  const obj = HasAppRootComponent.create();

  assert.equal(obj.get('_root').selector, `#ember-testing`);
  assert.equal(obj.get('_root').length, 1);

  testingStatusStub.restore();
});
