import $ from 'jquery';
import { typeOf } from '@ember/utils';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tour-components/overlay', 'Integration | Component | tour components/overlay', {
  integration: true,
});

test('registering', function(assert) {
  const doRegister = sinon.spy();
  this.setProperties({ doRegister });

  this.render(hbs`{{tour-components/overlay doRegister=doRegister}}`);
  assert.ok(doRegister.calledOnce, 'doRegister');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions), 'object');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.calculateCutout), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.removeCutout), 'function');
});

test('adding custom classes', function(assert) {
  const svgClasses = 'overlay-test-custom-class';
  this.setProperties({ svgClasses });

  this.render(hbs`{{tour-components/overlay svgClasses=svgClasses}}`);

  assert.ok($('svg.' + svgClasses).length, 'did render custom classes on svg element');
});

test('showing overlay or not', function(assert) {
  const done = assert.async();

  this.setProperties({ showOverlay: true });
  this.render(hbs`{{tour-components/overlay showOverlay=showOverlay}}`);

  assert.ok($('.overlay--svg').length, 'overlay is shown');

  this.setProperties({ showOverlay: false });
  wait().then(() => {
    assert.notOk($('.overlay--svg').length, 'overlay is NOT shown');

    done();
  });
});

test('adding/removing overlay cutout', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    idToHighlight = 'id-to-highlight',
    selectorToHighlight = '#' + idToHighlight;
  this.setProperties({ doRegister, idToHighlight, selectorToHighlight });

  this.render(hbs`
    <div id={{idToHighlight}} style="height: 100px; width: 100px;"></div>
    {{tour-components/overlay doRegister=doRegister elementToHighlight=selectorToHighlight}}
  `);

  assert.ok($('svg').length, 'did render');
  assert.equal($('svg defs mask rect').length, 1, 'only overlay, no cutout');
  assert.ok(doRegister.calledOnce);

  doRegister.firstCall.args[0].actions.calculateCutout();
  wait()
    .then(() => {
      assert.equal($('svg defs mask rect').length, 2, 'has overlay + cutout');

      doRegister.firstCall.args[0].actions.removeCutout();
      return wait();
    })
    .then(() => {
      assert.equal($('svg defs mask rect').length, 1, 'only overlay, no cutout');

      done();
    });
});
