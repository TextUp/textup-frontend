import Ember from 'ember';

// TODO remove

const { RSVP, run } = Ember;

export default Ember.Route.extend({
  setupController(controller) {
    this._super(...arguments);
    controller.set('data', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  },

  _loadNum: 0,
  actions: {
    onRefresh() {
      return new RSVP.Promise(resolve => {
        run.later(() => {
          this.controller.set('data', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          resolve();
        }, 2000);
      });
    },
    onLoad() {
      return new RSVP.Promise(resolve => {
        run.later(() => {
          this.controller.get('data').unshiftObjects([
            // this.controller.get('data').pushObjects([
            `LOAD COUNT SO FAR: ${this.get('_loadNum')}`,
            `load num ${this.get('_loadNum')}--2`,
            `load num ${this.get('_loadNum')}--3`,
            `load num ${this.get('_loadNum')}--4`,
            `load num ${this.get('_loadNum')}--5`,
            `load num ${this.get('_loadNum')}--6`,
            `load num ${this.get('_loadNum')}--7`,
            `load num ${this.get('_loadNum')}--8`,
            `load num ${this.get('_loadNum')}--9`,
            `load num ${this.get('_loadNum')}--10`,
          ]);
          this.incrementProperty('_loadNum');
          this.controller.get('_infiniteScroll.actions.restorePosition')();
          resolve();
        }, 2000);
      });
    },

    resetPosition(shouldAnimate) {
      this.controller.get('_infiniteScroll.actions.resetPosition')(shouldAnimate);
    },
  },
});
