import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('lock-pad', 'Integration | Component | lock pad', {
  integration: true,
});

test('it renders', function(assert) {
  const doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  this.setProperties({ doUpdateValStub, doValidateStub });

  this.render(hbs`{{lock-pad doUpdateVal=doUpdateValStub}}`);
  assert.ok(this.$('.lock-pad').length, '`doValidation` is nog required');

  this.render(hbs`{{lock-pad doUpdateVal=doUpdateValStub doValidate=doValidateStub}}`);
  assert.ok(this.$('.lock-pad').length);

  // requires proptypes
  assert.throws(() => this.render(hbs`{{lock-pad}}`), '`doUpdateVal` is required');
});

test('correct indicators', function(assert) {
  const doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  this.setProperties({ doUpdateValStub, doValidateStub });
  this.render(hbs`{{lock-pad doUpdateVal=doUpdateValStub doValidate=doValidateStub}}`);
  assert.ok(this.$('.lock-pad__indicator').length === 4);

  this.render(
    hbs`{{lock-pad doUpdateVal=doUpdateValStub doValidate=doValidateStub totalPadDigits=5}}`
  );
  assert.ok(this.$('.lock-pad__indicator').length === 5);
});

test('focusing on init', function(assert) {
  const doUpdateVal = sinon.spy(),
    done = assert.async();
  this.setProperties({ doUpdateVal });

  this.render(hbs`{{lock-pad doUpdateVal=doUpdateVal focusOnInit=true}}`);

  wait()
    .then(() => {
      assert.ok(this.$('.number-control').is(document.activeElement), 'number control is focused');

      this.render(hbs`{{lock-pad doUpdateVal=doUpdateVal focusOnInit=false}}`);
      return wait();
    })
    .then(() => {
      assert.notOk(
        this.$('.number-control').is(document.activeElement),
        'number control is NOT focused'
      );

      done();
    });
});

test('updating validation', function(assert) {
  const done = assert.async(),
    doValidateStub = sinon.stub(),
    promiseSpy = sinon.spy(),
    doUpdateValStub = sinon.stub();

  this.setProperties({ val: '', doUpdateValStub, doValidateStub });
  this.render(hbs`{{lock-pad val=val doUpdateVal=doUpdateValStub doValidate=doValidateStub}}`);

  this.set('val', `${Math.random()}`);
  wait()
    .then(() => {
      // changing val calls doValidate
      assert.equal(doValidateStub.callCount, 1);
      // doValidate handles non promise gracefully and removes loading state
      assert.ok(this.$('.fa-circle-o-notch').length === 0);

      doValidateStub.rejects();
      this.set('val', `${Math.random()}`);
      return wait();
    })
    .then(() => {
      // reject causes error state
      assert.equal(doValidateStub.callCount, 2);
      assert.ok(this.$('.lock-pad--error').length);

      doValidateStub.returns(new Ember.RSVP.Promise(promiseSpy));
      this.set('val', `${Math.random()}`);

      return wait();
    })
    .then(() => {
      // test loading state until promise accept
      assert.ok(this.$('.fa-circle-o-notch').length);

      promiseSpy.firstCall.args[0].call();
      done();
    });
});
