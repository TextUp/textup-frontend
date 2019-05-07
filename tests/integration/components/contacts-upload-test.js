import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import VcardUtils from 'textup-frontend/utils/vcard';
import Ember from 'ember';

const { RSVP } = Ember;

moduleForComponent('contacts-upload', 'Integration | Component | contacts upload', {
  integration: true,
});

test('it renders', function(assert) {
  this.render(hbs`{{contacts-upload}}`);
  assert.ok(this.$('.contacts-upload').length);
});

test('uploads correctly', function(assert) {
  const done = assert.async(),
    onImportStub = sinon.stub(),
    processStub = sinon.stub(VcardUtils, 'process');

  this.setProperties({ onImportStub });
  this.render(hbs`{{contacts-upload onImport=onImportStub}}`);
  assert.ok(this.$('.contacts-upload__input').length, 'has upload input');

  processStub.resolves();
  this.$('.contacts-upload__input').trigger(
    Ember.$.Event('change', { target: { files: ['oneFileHere'] }, data: 'data' })
  );
  wait().then(() => {
    assert.equal(processStub.calledOnce, true, 'process data called');
    assert.equal(processStub.firstCall.args[0].data, 'data', 'data passed to process');
    assert.equal(onImportStub.calledOnce, true, 'onImport called');

    processStub.restore();
    done();
  });
});

test('errors correctly', function(assert) {
  const done = assert.async(),
    onImportStub = sinon.stub(),
    processStub = sinon.stub(VcardUtils, 'process');

  this.setProperties({ onImportStub });
  this.render(hbs`{{contacts-upload onImport=onImportStub}}`);
  assert.ok(this.$('.contacts-upload__input').length, 'has upload input');

  processStub.rejects();
  this.$('.contacts-upload__input').trigger(
    Ember.$.Event('change', { target: { files: ['oneFileHere'] }, data: 'data' })
  );
  wait().then(() => {
    assert.ok(this.$('.contacts-upload--error').length, 'error state');
    assert.equal(onImportStub.calledOnce, false, 'onImport never called');

    processStub.restore();
    done();
  });
});

test('loads correctly', function(assert) {
  const done = assert.async(),
    onImportStub = sinon.stub(),
    processStub = sinon.stub(VcardUtils, 'process');

  let resolveFn;
  processStub.returns(new RSVP.Promise(resolve => (resolveFn = resolve)));

  this.setProperties({ onImportStub });
  this.render(hbs`{{contacts-upload onImport=onImportStub}}`);
  assert.ok(this.$('.contacts-upload__input').length, 'has upload input');

  this.$('.contacts-upload__input').trigger(
    Ember.$.Event('change', { target: { files: ['oneFileHere'] }, data: 'data' })
  );

  wait().then(() => {
    assert.equal(
      this.$('.contacts-upload__label-text')
        .text()
        .includes('Loading'),
      true,
      'loading state triggers'
    );
    resolveFn.call();
    processStub.restore();
    done();
  });
});
