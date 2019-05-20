import $ from 'jquery';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';

export default Mixin.create({
  _root: computed(function() {
    return $(getOwner(this).lookup('application:main').rootElement);

    // TODO
    // const rootSelector = Ember.testing
    //   ? '#ember-testing'
    //   : getOwner(this).lookup('application:main').rootElement;
    // return $(rootSelector);
  }),
});
