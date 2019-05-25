import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({
  dataService: service(),
  slideoutService: service(),

  // Properties
  // ----------

  anySharingChanges: false,
  contacts: null,
  slideoutTitle: computed('contacts.[]', function() {
    if (this.get('contacts')) {
      const numContacts = this.get('contacts.length'),
        name = this.get('contacts.firstObject.name');
      return numContacts > 1 ? `Share (${numContacts} selected)` : `Sharing ${name}`;
    }
  }),

  // Methods
  // -------

  openSlideout(contacts) {
    this.setProperties({
      anySharingChanges: false,
      contacts: ArrayUtils.ensureArrayAndAllDefined(contacts),
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/contact/share',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
  cancelSlideout() {
    ArrayUtils.ensureArrayAndAllDefined(this.get('contacts')).forEach(contact =>
      contact.clearSharingChanges()
    );
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('dataService')
      .persist(this.get('contacts'))
      .then(() => this.cancelSlideout());
  },
});
