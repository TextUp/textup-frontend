import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('location', 'Unit | Model | location', {
  needs: ['validator:presence', 'validator:number'],
});

test('validation for empty model', function(assert) {
  const m1 = this.subject();
  const done = assert.async();
  m1.validate().then(({ model, validations }) => {
    assert.equal(validations.get('isTruelyValid'), false);
    assert.equal(validations.get('errors').length, 3);
    assert.equal(model.get('validations.attrs.address.isValid'), false);
    assert.equal(model.get('validations.attrs.lat.isValid'), false);
    assert.equal(model.get('validations.attrs.lng.isValid'), false);
    done();
  });
});

test('validation for model with invalid values', function(assert) {
  const m1 = this.subject();
  run(function() {
    m1.setProperties({
      address: 'i am a valid address',
      lat: -91,
      lng: 200,
    });
  });
  const done = assert.async();
  m1.validate().then(({ model, validations }) => {
    assert.equal(validations.get('isTruelyValid'), false);
    assert.equal(validations.get('errors').length, 2);
    assert.equal(model.get('validations.attrs.address.isValid'), true);
    assert.equal(model.get('validations.attrs.lat.isValid'), false);
    assert.equal(model.get('validations.attrs.lng.isValid'), false);
    done();
  });
});

test('validation for model filled with all valid values', function(assert) {
  const m1 = this.subject();
  run(function() {
    m1.setProperties({
      address: 'i am a valid address',
      lat: 10,
      lng: 100,
    });
  });
  const done = assert.async();
  m1.validate().then(({ model, validations }) => {
    assert.equal(validations.get('isTruelyValid'), true);
    assert.equal(validations.get('errors').length, 0);
    assert.equal(model.get('validations.attrs.address.isValid'), true);
    assert.equal(model.get('validations.attrs.lat.isValid'), true);
    assert.equal(model.get('validations.attrs.lng.isValid'), true);
    done();
  });
});

test('setting and retrieving latlng', function(assert) {
  const m1 = this.subject(),
    validData = {
      lat: 12,
      lng: 88,
    },
    invalidData = {
      lat: 888,
      lng: 888,
    };
  run(function() {
    m1.set('latLng', null);
    assert.equal(m1.get('lat'), null);
    assert.equal(m1.get('lng'), null);
    // computed property getter not called until we set one of the dependent keys
    // therefore, the value passed into the setter is returned here
    assert.deepEqual(m1.get('latLng'), null);

    m1.set('latLng', {});
    assert.equal(m1.get('lat'), null);
    assert.equal(m1.get('lng'), null);
    // computed property getter not called until we set one of the dependent keys
    // therefore, the value passed into the setter is returned here
    assert.deepEqual(m1.get('latLng'), {});

    m1.set('latLng', invalidData);
    assert.equal(m1.get('lat'), invalidData.lat);
    assert.equal(m1.get('lng'), invalidData.lng);
    assert.deepEqual(m1.get('latLng'), invalidData);

    m1.set('latLng', validData);
    assert.equal(m1.get('lat'), validData.lat);
    assert.equal(m1.get('lng'), validData.lng);
    assert.deepEqual(m1.get('latLng'), validData);

    const newLat = 12,
      newLon = 22;
    m1.set('lat', newLat);
    m1.set('lng', newLon);
    assert.equal(m1.get('lat'), newLat);
    assert.equal(m1.get('lng'), newLon);
    assert.deepEqual(m1.get('latLng'), { lat: newLat, lng: newLon });
  });
});
