import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  dataService: service(),
  slideoutService: service(),
  stateService: service(),
  tagService: service(),

  // Properties
  // ----------

  anyMembershipChanges: false,
  contacts: null,
  tags: readOnly('stateService.owner.phone.content.tags'),
  slideoutTitle: computed('contacts.[]', function() {
    if (this.get('contacts')) {
      const numContacts = this.get('contacts.length');
      return numContacts > 1
        ? `Tags (${numContacts})`
        : `${this.get('contacts.firstObject.name')} Tags`;
    }
  }),

  // Methods
  // -------

  openSlideout(contacts) {
    this.setProperties({
      anyMembershipChanges: false,
      contacts: ArrayUtils.ensureArrayAndAllDefined(contacts),
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/tag/membership',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    ArrayUtils.ensureArrayAndAllDefined(this.get('tags')).forEach(tag =>
      tag.clearMembershipChanges()
    );
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('tagService')
      .updateTagMemberships(this.get('tags'), this.get('contacts'))
      .then(() => this.get('slideoutService').closeSlideout());
  },
});
