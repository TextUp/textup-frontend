import Ember from 'ember';

const { isArray } = Ember;

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),
  tagService: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialTagMembershipProps());
  },

  actions: {
    startTagMembershipSlideout(contacts) {
      this.get('controller').setProperties({
        tagMembershipContacts: isArray(contacts) ? contacts : [contacts],
        tagMembershipTags: this.get('stateManager.owner.phone.content.tags')
      });
      this.send(
        'toggleSlideout',
        'slideouts/tag/membership',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
      );
    },
    cancelTagMembershipSlideout() {
      this.send('closeSlideout');
      this._tryClearTagMembershipChanges();
      this.get('controller').setProperties(this._initialTagMembershipProps());
    },
    finishTagMembershipSlideout() {
      const controller = this.get('controller');
      this.get('tagService')
        .updateTagMemberships(
          controller.get('tagMembershipTags'),
          controller.get('tagMembershipContacts')
        )
        .then(() => this.send('cancelTagMembershipSlideout'));
    }
  },
  _initialTagMembershipProps() {
    return { tagMembershipContacts: null, tagMembershipTags: null };
  },
  _tryClearTagMembershipChanges() {
    const tags = this.get('tagMembershipTags');
    if (isArray(tags)) {
      tags.forEach(tag => tag.clearMembershipChanges());
    }
  }
});
