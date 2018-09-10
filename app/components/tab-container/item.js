import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
  title: defaultIfAbsent(''),
  doRegister: null,

  classNames: 'tab-container-item pending',

  _height: null,

  // Computed properties
  // -------------------

  publicAPI: Ember.computed(function() {
    return {
      title: this.get('title'),
      height: this.get('_height'),
      actions: {
        initialize: this.initialize.bind(this),
        hide: this.hide.bind(this),
        show: this.show.bind(this)
      }
    };
  }),

  // Events
  // ------

  didInitAttrs: function() {
    this._super(...arguments);
    Ember.tryInvoke(this, 'doRegister', [this.get('publicAPI')]);
  },

  // Helpers
  // -------

  initialize: function(animation, shouldShow) {
    const $el = this.$();
    if (animation === 'slide') {
      // set height for showing action
      const height = $el.height();
      this.set('_height', height);
      // start with 0 width to allow for sliding in
      $el.css({
        width: 0,
        height: height
      });
    }
    if (shouldShow) {
      this.show(animation);
      // want to show animation in immediately
      $el.removeClass('pending');
    } else {
      this.hide(animation).then(() => {
        // don't want to show hiding so we
        // show after hiding is complete
        $el.removeClass('pending');
      });
    }
  },
  show: function(animation) {
    const $el = this.$();
    return new Ember.RSVP.Promise(resolve => {
      if (animation === 'fade') {
        $el
          .fadeIn()
          .promise()
          .done(resolve);
      } else if (animation === 'slide') {
        $el.css('height', this.get('_height'));
        $el.animate(
          {
            width: '100%'
          },
          {
            complete: function() {
              $el.css('height', 'auto');
              resolve();
            }
          }
        );
      } else {
        $el
          .show(0, '')
          .promise()
          .done(resolve);
      }
    });
  },
  hide: function(animation) {
    const $el = this.$();
    return new Ember.RSVP.Promise(resolve => {
      if (animation === 'fade') {
        $el
          .fadeOut()
          .promise()
          .done(resolve);
      } else if (animation === 'slide') {
        const height = $el.height();
        $el.css('height', height);
        this.set('_height', height);
        // start animation hide after setting new height
        Ember.run.next(this, function() {
          $el.animate(
            {
              width: '0'
            },
            {
              complete: function() {
                $el.css('height', 0);
                resolve();
              }
            }
          );
        });
      } else {
        $el
          .hide(0, '')
          .promise()
          .done(resolve);
      }
    });
  }
});
