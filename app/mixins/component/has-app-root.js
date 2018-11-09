import Ember from 'ember';

const { computed } = Ember;

export default Ember.Mixin.create({
  _root: computed(function() {
    const rootSelector = Ember.testing
      ? '#ember-testing'
      : Ember.getOwner(this).lookup('application:main').rootElement;
    return Ember.$(rootSelector);
  })
});
