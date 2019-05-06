import ArrayUtils from 'textup-frontend/utils/array';
import Ember from 'ember';
import TypeUtils from 'textup-frontend/utils/type';

const { get, RSVP, isArray } = Ember;

export default Ember.Service.extend({
  loadingSlider: Ember.inject.service(),
  requestService: Ember.inject.service(),

  persist(data, ...thens) {
    return new RSVP.Promise((resolve, reject) => {
      const changedModels = ArrayUtils.ensureArrayAndAllDefined(data)
        .filter(TypeUtils.isAnyModel)
        .filterBy('isDirty')
        .uniq(); // uniq so we don't send duplicate requests
      if (Ember.isEmpty(changedModels)) {
        ArrayUtils.tryCallAll(thens);
        return resolve(data);
      }
      this.get('loadingSlider').startLoading();
      this.get('requestService')
        .handleIfError(RSVP.all(changedModels.map(model => model.save())))
        .then(success => {
          ArrayUtils.tryCallAll(thens);
          resolve(isArray(data) ? success : success[0]);
        }, reject)
        .finally(() => this.get('loadingSlider').endLoading());
    });
  },

  markForDelete(data) {
    ArrayUtils.ensureArrayAndAllDefined(data)
      .filter(TypeUtils.isAnyModel)
      .forEach(model => {
        if (model.get('isNew')) {
          model.rollbackAttributes();
        } else {
          model.deleteRecord();
        }
      });
  },

  clearList(models, propName, ...thens) {
    ArrayUtils.ensureArrayAndAllDefined(models)
      .filter(TypeUtils.isAnyModel)
      .forEach(model => {
        const val = model.get(propName);
        if (isArray(val)) {
          val.clear();
        }
      });
    ArrayUtils.tryCallAll(thens);
  },

  revert(models, ...thens) {
    ArrayUtils.ensureArrayAndAllDefined(models)
      .filter(TypeUtils.isAnyModel)
      .forEach(model => model.rollbackAttributes());
    ArrayUtils.tryCallAll(thens);
  },

  revertProperty(models, propName, ...thens) {
    ArrayUtils.ensureArrayAndAllDefined(models)
      .filter(TypeUtils.isAnyModel)
      .forEach(model => {
        const changes = get(model.changedAttributes(), propName);
        if (isArray(changes)) {
          model.set(propName, changes[0]);
        }
      });
    ArrayUtils.tryCallAll(thens);
  },
});
