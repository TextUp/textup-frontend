import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { isArray } from '@ember/array';
import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  dataService: service(),
  tagService: service(),
  stateService: service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialTagMembershipProps());
  },

  actions: {
    startTagMembershipSlideout(contacts) {
      this.get('controller').setProperties({
        tagMembershipContacts: isArray(contacts) ? contacts : [contacts],
        tagMembershipTags: this.get('stateService.owner.phone.content.tags'),
      });
      this.send(
        'toggleSlideout',
        'slideouts/tag/membership',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DETAIL
      );
    },
    cancelTagMembershipSlideout() {
      this.send('closeSlideout');
      this._tryClearTagMembershipChanges();
      this.get('controller').setProperties(this._initialTagMembershipProps());
    },
    finishTagMembershipSlideout() {
      const controller = this.get('controller');
      return this.get('tagService')
        .updateTagMemberships(
          controller.get('tagMembershipTags'),
          controller.get('tagMembershipContacts')
        )
        .then(() => this.send('cancelTagMembershipSlideout'));
    },
  },
  _initialTagMembershipProps() {
    return { tagMembershipContacts: null, tagMembershipTags: null };
  },
  _tryClearTagMembershipChanges() {
    const tags = this.get('tagMembershipTags');
    if (isArray(tags)) {
      tags.forEach(tag => tag.clearMembershipChanges());
    }
  },
});
