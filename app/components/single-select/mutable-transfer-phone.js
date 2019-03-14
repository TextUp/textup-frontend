import config from 'textup-frontend/config/environment';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';
import Ember from 'ember';

const { get } = Ember;

export default Ember.Component.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  store: Ember.inject.service('store'),

  data: defaultIfAbsent([]),
  phoneOwner: null,
  selected: null,
  identityProperty: defaultIfAbsent('id'),

  // Computed properties
  // -------------------

  dataExcludingSelf: Ember.computed('data.[]', 'phoneOwner', function() {
    return this._excludeOwner(this.get('data'));
  }),

  actions: {
    select: function(transferTarget) {
      return new Ember.RSVP.Promise(resolve => {
        this.set('selected', transferTarget);
        resolve();
      });
    },
    deselect: function() {
      this.set('selected', null);
    },
    search: function(val) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('authService')
          .authRequest({
            type: 'GET',
            url: `${config.host}/v1/staff?search=${val}`,
          })
          .then(data => {
            const store = this.get('store'),
              staffs = data.staff,
              models = staffs
                ? staffs.map(staff => {
                    return store.push(store.normalize('staff', staff));
                  })
                : [];
            resolve(this._excludeOwner(models));
          }, this.get('dataService').buildErrorHandler(reject));
      });
    },
  },

  // Helper methods
  // --------------

  _excludeOwner: function(array) {
    const owner = this.get('phoneOwner'),
      identProp = this.get('identityProperty'),
      ownerIdent = get(owner, identProp);
    return (array || []).filter(item => get(item, identProp) !== ownerIdent);
  },
});
