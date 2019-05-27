import { isEmpty } from '@ember/utils';
import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import RSVP from 'rsvp';
import { isArray } from '@ember/array';
import ArrayUtils from 'textup-frontend/utils/array';
import TypeUtils from 'textup-frontend/utils/type';

export default Service.extend({
  loadingSlider: service(),
  requestService: service(),

  persist(data, ...thens) {
    return new RSVP.Promise((resolve, reject) => {
      const changedModels = ArrayUtils.ensureArrayAndAllDefined(data)
        .filter(TypeUtils.isAnyModel)
        .filterBy('isDirty')
        .uniq(); // uniq so we don't send duplicate requests
      if (isEmpty(changedModels)) {
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
