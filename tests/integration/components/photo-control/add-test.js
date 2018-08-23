import Ember from 'ember';
import * as PhotoUtils from 'textup-frontend/utils/photo';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('photo-control/add', 'Integration | Component | photo control/add', {
  integration: true
});

test('inputs', function(assert) {
  assert.throws(() => this.render(hbs`{{photo-control/add}}`), 'must pass in onAdd handler');

  this.set('onAdd', 'not a function');
  assert.throws(
    () => this.render(hbs`{{photo-control/add onAdd=onAdd}}`),
    'must pass in a function'
  );

  this.set('onAdd', () => {});

  this.render(hbs`{{photo-control/add onAdd=onAdd}}`);

  assert.ok(this.$('.photo-control__add').length);
  assert.ok(
    this.$()
      .text()
      .includes('Add images')
  );
});

test('rendering nonblock vs block forms', function(assert) {
  const testClassName = 'photo-control-add-block-form';

  this.setProperties({ onAdd: () => {}, testClassName });

  this.render(hbs`{{photo-control/add onAdd=onAdd}}`);

  assert.ok(this.$('.photo-control__add').length);

  this.render(hbs`
    {{#photo-control/add onAdd=onAdd}}
      <span class="{{testClassName}}"></span>
    {{/photo-control/add}}
  `);

  assert.ok(this.$('.photo-control__add').length);
  assert.ok(this.$(`.${testClassName}`).length, 'yielded block is rendered');
});

test('handling file upload', function(assert) {
  // can spy on imports using the * imports. See https://stackoverflow.com/a/33676328
  const extractStub = sinon.stub(PhotoUtils, 'extractImagesFromEvent'),
    onAddSpy = sinon.spy(),
    done = assert.async(),
    randValue1 = Math.random();

  this.set('onAddSpy', onAddSpy);
  this.render(hbs`{{photo-control/add onAdd=onAddSpy}}`);
  assert.ok(this.$('.photo-control__add input').length);

  run(() => {
    extractStub.callsFake(() => new Ember.RSVP.Promise(resolve => resolve(randValue1)));
    this.$('.photo-control__add input').change();

    wait()
      .then(() => {
        assert.ok(extractStub.calledOnce, 'called extract helper once');
        assert.ok(onAddSpy.calledOnce, 'called add handler when promise successfully resolves');
        assert.ok(
          onAddSpy.calledWith(randValue1),
          "add handler called with Promise's resolved value"
        );
        assert.ok(
          this.$()
            .text()
            .includes('Add images')
        );

        extractStub.callsFake(() => new Ember.RSVP.Promise((resolve, reject) => reject()));
        this.$('.photo-control__add input').change();
        return wait();
      })
      .then(() => {
        assert.ok(extractStub.calledTwice, 'called extract helper twice');
        assert.ok(onAddSpy.calledOnce, 'add handler not called when promise rejects');
        assert.ok(
          this.$()
            .text()
            .includes('Please try again')
        );

        extractStub.restore();
        done();
      });
  });
});

test('handling async change events in rapid succession', function(assert) {
  const extractStub = sinon.stub(PhotoUtils, 'extractImagesFromEvent'),
    onAddSpy = sinon.spy(),
    done = assert.async(),
    randValue1 = Math.random();

  this.set('onAddSpy', onAddSpy);
  this.render(hbs`{{photo-control/add onAdd=onAddSpy}}`);
  assert.ok(this.$('.photo-control__add input').length);

  run(() => {
    extractStub.callsFake(
      () => new Ember.RSVP.Promise(resolve => Ember.run.later(this, resolve, randValue1, 500))
    );
    Array(5)
      .fill()
      .forEach(() => this.$('.photo-control__add input').change());

    wait().then(() => {
      assert.ok(
        onAddSpy.calledOnce,
        'despite multiple overlapping calls, add handler only called once'
      );
      assert.ok(onAddSpy.calledWith(randValue1));

      extractStub.restore();
      done();
    });
  });
});
