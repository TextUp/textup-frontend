import Constants from 'textup-frontend/constants';
import ModelOwnsPhone from 'textup-frontend/mixins/model/owns-phone';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  dataService: service(),
  store: service(),

  persistPhoneOwner(phoneOwner) {
    if (ModelOwnsPhone.detect(phoneOwner)) {
      const isTransfer = phoneOwner.get('phoneAction') === Constants.ACTION.PHONE.TRANSFER,
        data = phoneOwner.get('phoneActionData'),
        targetId = isTransfer ? get(data, 'id') : null,
        targetClass = isTransfer ? get(data, Constants.PROP_NAME.MODEL_NAME) : null;
      return this.get('dataService')
        .persist(phoneOwner)
        .then(() => {
          if (targetId && targetClass) {
            return this.get('store').findRecord(targetClass, targetId, { reload: true });
          }
        });
    }
  },
});
