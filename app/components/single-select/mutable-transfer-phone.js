import { Promise } from 'rsvp';
import ArrayProxy from '@ember/array/proxy';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Organization from 'textup-frontend/models/organization';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  requestService: service(),
  store: service(),

  propTypes: {
    data: PropTypes.EmberObject,
    phoneOwner: PropTypes.EmberObject,
    org: PropTypes.instanceOf(Organization),
    selected: PropTypes.oneOfType([PropTypes.null, PropTypes.object]),
  },
  getDefaultProps() {
    return { data: ArrayProxy.create() };
  },

  _dataExcludingSelf: computed('data.[]', 'phoneOwner', function() {
    return this._excludeOwner(this.get('data'));
  }),

  actions: {
    select(transferTarget) {
      return new Promise(resolve => {
        this.set('selected', transferTarget);
        resolve();
      });
    },
    deselect() {
      this.set('selected', null);
    },
    search(val) {
      return new Promise((resolve, reject) => {
        const orgId = this.get('org.id');
        this.get('requestService')
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
          }, reject);
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
