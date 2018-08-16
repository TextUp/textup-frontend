import DS from 'ember-data';
import Ember from 'ember';

const { get } = Ember;

function filterUniques(objs, propertyKey) {
  const uniqMap = Object.create(null),
    uniqs = [];
  objs.forEach(obj => {
    const prop = String(get(obj, propertyKey));
    if (!get(uniqMap, prop)) {
      uniqMap[prop] = true;
      uniqs.pushObject(obj);
    }
  });
  return uniqs;
}

export default function uniqBy(dependentKey, propertyKey) {
  return Ember.computed(`${dependentKey}.@each.${propertyKey}`, function() {
    const isPromiseArray = this.get(`${dependentKey}.isFulfilled`) !== undefined;
    if (isPromiseArray) {
      return DS.PromiseArray.create({
        promise: new Ember.RSVP.Promise((resolve, reject) => {
          this.get(dependentKey).then(objs => {
            resolve(filterUniques(objs, propertyKey));
          }, reject);
        })
      });
    } else {
      return filterUniques(this.get(dependentKey), propertyKey);
    }
  });
}
