import config from 'textup-frontend/config/environment';
import ElementUtils from 'textup-frontend/utils/element';
import Ember from 'ember';
import { module, test } from 'qunit';

module('Unit | Utility | element');

test('is or contains element', function(assert) {
  const $root = Ember.$(config.APP.rootElement),
    el1 = document.createElement('div'),
    el2 = document.createElement('div'),
    el3 = document.createElement('div');
  // el1 contains el2 and el3 is standalone
  $root.append(el1, el2, el3);
  Ember.$(el2).appendTo(el1);

  assert.equal(ElementUtils.isOrContainsElement(), false);
  assert.equal(ElementUtils.isOrContainsElement(el1), false);
  assert.equal(ElementUtils.isOrContainsElement(null, el1), false);

  assert.equal(ElementUtils.isOrContainsElement(el1, el1), true);
  assert.equal(ElementUtils.isOrContainsElement(el2, el1), false);
  assert.equal(ElementUtils.isOrContainsElement(el1, el2), true);

  assert.equal(ElementUtils.isOrContainsElement(el1, el3), false);
  assert.equal(ElementUtils.isOrContainsElement(el2, el3), false);
});

test('building element', function(assert) {
  let el = ElementUtils.buildElement();
  assert.ok(el.tagName, 'DIV', 'default tag name is div');
  assert.equal(el.classList.length, 0, 'no classes');

  el = ElementUtils.buildElement('span');
  assert.ok(el.tagName, 'SPAN');
  assert.equal(el.classList.length, 0);

  el = ElementUtils.buildElement('ul', 'class1', null);
  assert.ok(el.tagName, 'UL');
  assert.equal(el.classList.length, 1);

  el = ElementUtils.buildElement('ul', 'class1', null, 'class2');
  assert.ok(el.tagName, 'UL');
  assert.equal(el.classList.length, 2);

  el = ElementUtils.buildElement('ul', 'class1', 'class2', 'class3');
  assert.ok(el.tagName, 'UL');
  assert.equal(el.classList.length, 3);

  assert.throws(() => ElementUtils.buildElement('invalid tag name'));
});

test('wrapping an element in another element', function(assert) {
  const $root = Ember.$(config.APP.rootElement),
    containerEl = document.createElement('div'),
    childEl = document.createElement('div');
  // childEl is in DOM but containerEl is not
  $root.append(childEl);

  assert.notOk(Ember.$.contains($root[0], containerEl), 'container is not in DOM');

  ElementUtils.wrapElement(containerEl, childEl);

  assert.ok(Ember.$.contains($root[0], containerEl), 'container is now in DOM');
  assert.ok(Ember.$.contains(containerEl, childEl), 'container contains child');
});

test('unwrapping element', function(assert) {
  const $root = Ember.$(config.APP.rootElement),
    containerEl = document.createElement('div'),
    childEl = document.createElement('div');
  // containerEl contains childEl
  $root.append(containerEl, childEl);
  Ember.$(containerEl).append(childEl);

  assert.ok(Ember.$.contains($root[0], containerEl), 'container is in DOM');
  assert.ok(Ember.$.contains($root[0], childEl), 'child is in DOM');

  ElementUtils.unwrapElement(childEl);

  assert.notOk(Ember.$.contains($root[0], containerEl), 'container is NOT in DOM');
  assert.ok(Ember.$.contains($root[0], childEl), 'child is in DOM');
});

test('inserting elements within a container element', function(assert) {
  const $root = Ember.$(config.APP.rootElement),
    el1 = document.createElement('div'),
    el2 = document.createElement('div'),
    el3 = document.createElement('div');
  // only el1 is in DOM
  $root.append(el1);

  assert.ok(Ember.$.contains($root[0], el1), 'el1 is in DOM');
  assert.notOk(Ember.$.contains($root[0], el2), 'el2 is NOT in DOM');
  assert.notOk(Ember.$.contains($root[0], el3), 'el3 is NOT in DOM');

  ElementUtils.insertElementsWithin(el1, el2, el3);

  assert.ok(Ember.$.contains($root[0], el1), 'el1 is in DOM');
  assert.ok(Ember.$.contains($root[0], el2), 'el2 is in DOM');
  assert.ok(Ember.$.contains($root[0], el3), 'el3 is in DOM');
  assert.ok(Ember.$.contains(el1, el2), 'el1 contains el2');
  assert.ok(Ember.$.contains(el1, el3), 'el1 contains el3');
});

test('removing element from DOM', function(assert) {
  const $root = Ember.$(config.APP.rootElement),
    el1 = document.createElement('div');
  $root.append(el1);

  assert.ok(Ember.$.contains($root[0], el1), 'el1 is in DOM');

  ElementUtils.removeElement(el1);

  assert.notOk(Ember.$.contains($root[0], el1), 'el1 is NOT in DOM');
});
