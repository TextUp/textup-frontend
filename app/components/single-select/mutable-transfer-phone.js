import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import Organization from 'textup-frontend/models/organization';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { get, computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  store: Ember.inject.service(),

  propTypes: {
    data: PropTypes.EmberObject,
    phoneOwner: PropTypes.EmberObject,
    org: PropTypes.instanceOf(Organization),
    selected: PropTypes.oneOfType([PropTypes.null, PropTypes.object]),
  },
  getDefaultProps() {
    return { data: Ember.ArrayProxy.create() };
  },

  _dataExcludingSelf: computed('data.[]', 'phoneOwner', function() {
    return this._excludeOwner(this.get('data'));
  }),

  actions: {
    select(transferTarget) {
      return new Ember.RSVP.Promise(resolve => {
        this.set('selected', transferTarget);
        resolve();
      });
    },
    deselect() {
      this.set('selected', null);
    },
    search(val) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const orgId = this.get('org.id');
        this.get('authService')
          .authRequest({
            type: Constants.REQUEST_METHOD.GET,
            url: `${config.host}/v1/staff?organizationId=${orgId}&search=${val}`,
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

  _excludeOwner(array) {
    const owner = this.get('phoneOwner'),
      idProp = 'id',
      typeProp = Constants.PROP_NAME.MODEL_NAME;
    return (array || []).filter(item => {
      return (
        get(item, idProp) !== get(owner, idProp) ||
        (get(item, idProp) === get(owner, idProp) && get(item, typeProp) !== get(owner, typeProp))
      );
    });
  },
});
