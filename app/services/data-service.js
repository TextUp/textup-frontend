import ArrayUtils from 'textup-frontend/utils/array';
import Ember from 'ember';
import TypeUtils from 'textup-frontend/utils/type';

const { get, RSVP, isArray } = Ember;

export default Ember.Service.extend({
  loadingSlider: Ember.inject.service(),
  requestService: Ember.inject.service(),

  persist(data, ...thens) {
    return new RSVP.Promise((resolve, reject) => {
      const changedModels = ArrayUtils.ensureArray(data)
        .filterBy('isDirty')
        .uniq(); // uniq so we don't send duplicate requests
      if (Ember.isEmpty(changedModels)) {
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
    ArrayUtils.ensureArray(data).forEach(model => {
      if (TypeUtils.isAnyModel(model) && model.get('isNew')) {
        model.rollbackAttributes();
      } else {
        model.deleteRecord();
      }
    });
  },

  clearList(models, propName, ...thens) {
    ArrayUtils.ensureArrayAndAllDefined(models).forEach(
      model => TypeUtils.isAnyModel(model) && ArrayUtils.ensureArray(model.get(propName)).clear()
    );
    ArrayUtils.tryCallAll(thens);
  },

  revert(models, ...thens) {
    ArrayUtils.ensureArrayAndAllDefined(models).forEach(
      model => TypeUtils.isAnyModel(model) && model.rollbackAttributes()
    );
    ArrayUtils.tryCallAll(thens);
  },

  revertAttribute(models, attributeName, ...thens) {
    ArrayUtils.ensureArrayAndAllDefined(models).forEach(model => {
      if (TypeUtils.isAnyModel(model)) {
        const changes = get(model.changedAttributes(), attributeName);
        if (isArray(changes)) {
          model.set(attributeName, changes[0]);
        }
      }
    });
    ArrayUtils.tryCallAll(thens);
  },
});
