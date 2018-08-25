import * as LocationUtils from 'textup-frontend/utils/location';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run, typeOf } = Ember,
  VALID_URL = 'https://via.placeholder.com/5x5',
  INVALID_URL = 'invalid image url';
let buildUrlStub;

moduleForComponent('location-preview', 'Integration | Component | location preview', {
  integration: true,
  beforeEach() {
    buildUrlStub = sinon.stub(LocationUtils, 'buildPreviewUrl');
  },
  afterEach() {
    buildUrlStub.restore();
  }
});

test('invalid inputs', function(assert) {
  this.setProperties({
    location: {},
    onSuccess: 'not a function',
    onFailure: 'not a function',
    loadingMessage: 88,
    errorMessage: 88
  });

  assert.throws(() => this.render(hbs`{{location-preview}}`), 'requires location');

  assert.throws(
    () => this.render(hbs`{{location-preview location=location}}`),
    'location must be Location model'
  );

  assert.throws(
    () =>
      this.render(hbs`
          {{location-preview location=location
            onSuccess=onSuccess
            onFailure=onFailure
            loadingMessage=loadingMessage
            errorMessage=errorMessage}}
        `),
    'optional properties are of invalid type'
  );
});

test('valid inputs', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      location = store.createRecord('location');
    this.setProperties({
      location,
      onSuccess: () => null,
      onFailure: () => null,
      loadingMessage: 'a string',
      errorMessage: 'a string'
    });

    this.render(hbs`{{location-preview location=location}}`);

    assert.ok(this.$('.location-preview').length, 'did render');

    this.render(hbs`
      {{location-preview location=location
        onSuccess=onSuccess
        onFailure=onFailure
        loadingMessage=loadingMessage
        errorMessage=errorMessage}}
    `);

    assert.ok(this.$('.location-preview').length, 'did render');
  });
});

test('rendering valid location + clicking', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      location = store.createRecord('location', {
        address: Math.random(),
        latLng: { lat: Math.random(), lng: Math.random() }
      }),
      onSuccess = sinon.spy(),
      onFailure = sinon.spy(),
      done = assert.async();
    buildUrlStub.callsFake(() => VALID_URL);

    this.setProperties({ location, onSuccess, onFailure });
    this.render(
      hbs`{{location-preview location=location onSuccess=onSuccess onFailure=onFailure}}`
    );

    assert.ok(this.$('.location-preview').length, 'did render');

    // wait doesn't always wait long enough
    Ember.run.later(() => {
      assert.ok(buildUrlStub.calledOnce, 'build url handler called');
      assert.ok(buildUrlStub.args.every(argList => argList.length === 4));
      assert.ok(buildUrlStub.args.every(argList => typeOf(argList[0]) === 'object'));
      assert.ok(buildUrlStub.args.every(argList => typeOf(argList[3]) === 'number'));
      assert.equal(buildUrlStub.firstCall.args[1], location.get('latLng.lat'));
      assert.equal(buildUrlStub.firstCall.args[2], location.get('latLng.lng'));

      assert.ok(onSuccess.calledOnce, 'success handler called');
      assert.ok(onFailure.notCalled, 'not failure');
      assert.ok(this.$('.location-preview img').length, 'preview img is shown');

      // for events bound on component, need to use trigger instead of triggerHandler
      this.$('.location-preview')
        .first()
        .click();
      wait()
        .then(() => {
          const text = this.$().text();
          assert.ok(text.includes(location.get('address')), 'address is displayed');

          this.$('.location-preview')
            .first()
            .click();
          return wait();
        })
        .then(() => {
          const text = this.$().text();
          assert.notOk(text.includes(location.get('address')), 'address is hidden');

          done();
        });
    }, 500);
  });
});

test('rendering invalid location + clicking', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      location = store.createRecord('location', {
        address: Math.random(),
        latLng: { lat: Math.random(), lng: Math.random() }
      }),
      onSuccess = sinon.spy(),
      onFailure = sinon.spy(),
      errorMessage = `${Math.random()}`,
      done = assert.async();
    buildUrlStub.callsFake(() => INVALID_URL);

    this.setProperties({ location, onSuccess, onFailure, errorMessage });
    this.render(
      hbs`{{location-preview location=location onSuccess=onSuccess onFailure=onFailure errorMessage=errorMessage}}`
    );

    assert.ok(this.$('.location-preview').length, 'did render');

    // wait doesn't wait long enough
    Ember.run.later(() => {
      assert.ok(buildUrlStub.calledOnce, 'build url handler called');
      assert.ok(buildUrlStub.args.every(argList => argList.length === 4));
      assert.ok(buildUrlStub.args.every(argList => typeOf(argList[0]) === 'object'));
      assert.ok(buildUrlStub.args.every(argList => typeOf(argList[3]) === 'number'));
      assert.equal(buildUrlStub.firstCall.args[1], location.get('latLng.lat'));
      assert.equal(buildUrlStub.firstCall.args[2], location.get('latLng.lng'));

      assert.ok(onSuccess.notCalled, 'load not successful');
      assert.ok(onFailure.calledOnce, 'loading failure');
      const text = this.$().text();
      assert.ok(text.includes(errorMessage), 'error message is displayed');

      this.$('.location-preview')
        .first()
        .click();
      wait()
        .then(() => {
          const text = this.$().text();
          assert.notOk(text.includes(errorMessage), 'error message is hidden');
          assert.ok(text.includes(location.get('address')), 'address is displayed');

          this.$('.location-preview')
            .first()
            .click();
          return wait();
        })
        .then(() => {
          const text = this.$().text();
          assert.ok(text.includes(errorMessage), 'error message is displayed');
          assert.notOk(text.includes(location.get('address')), 'address is hidden');

          done();
        });
    }, 500);
  });
});

test('re-rendering on location changes', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      location = store.createRecord('location', {
        address: Math.random(),
        latLng: { lat: Math.random(), lng: Math.random() }
      }),
      onSuccess = sinon.spy(),
      onFailure = sinon.spy(),
      errorMessage = `${Math.random()}`,
      done = assert.async();
    buildUrlStub.callsFake(() => INVALID_URL);

    this.setProperties({ location, onSuccess, onFailure, errorMessage });
    this.render(
      hbs`{{location-preview location=location onSuccess=onSuccess onFailure=onFailure errorMessage=errorMessage}}`
    );

    assert.ok(this.$('.location-preview').length, 'did render');

    // wait doesn't wait long enough
    Ember.run.later(() => {
      assert.ok(buildUrlStub.calledOnce, 'build url handler called');
      assert.ok(buildUrlStub.args.every(argList => argList.length === 4));
      assert.ok(buildUrlStub.args.every(argList => typeOf(argList[0]) === 'object'));
      assert.ok(buildUrlStub.args.every(argList => typeOf(argList[3]) === 'number'));
      assert.equal(buildUrlStub.firstCall.args[1], location.get('latLng.lat'));
      assert.equal(buildUrlStub.firstCall.args[2], location.get('latLng.lng'));

      assert.ok(onSuccess.notCalled, 'load not successful');
      assert.ok(onFailure.calledOnce, 'loading failure');
      const text = this.$().text();
      assert.ok(text.includes(errorMessage), 'error message is displayed');

      buildUrlStub.callsFake(() => VALID_URL);
      location.set('latLng', { lat: Math.random(), lng: Math.random() });

      // wait doesn't wait long enough
      Ember.run.later(() => {
        assert.ok(buildUrlStub.calledTwice, 'build url handler called');
        assert.ok(buildUrlStub.args.every(argList => argList.length === 4));
        assert.ok(buildUrlStub.args.every(argList => typeOf(argList[0]) === 'object'));
        assert.ok(buildUrlStub.args.every(argList => typeOf(argList[3]) === 'number'));
        assert.notEqual(buildUrlStub.firstCall.args[1], location.get('latLng.lat'));
        assert.notEqual(buildUrlStub.firstCall.args[2], location.get('latLng.lng'));
        assert.equal(buildUrlStub.secondCall.args[1], location.get('latLng.lat'));
        assert.equal(buildUrlStub.secondCall.args[2], location.get('latLng.lng'));

        assert.ok(onSuccess.calledOnce, 'this time is success');
        assert.ok(onFailure.calledOnce);

        const text = this.$().text();
        assert.notOk(text.includes(errorMessage), 'error message is hidden');
        assert.ok(this.$('.location-preview img').length, 'preview img is shown again');

        done();
      }, 500);
    }, 500);
  });
});
