import Ember from 'ember';
import DS from 'ember-data';

const {
    notEmpty
} = Ember.computed;

export default Ember.Mixin.create({
    init: function() {
        this._super(...arguments);
        this.set('contacts', []);
    },
    rollbackAttributes: function() {
        this._super(...arguments);
        this.set('newPhone', null);
    },

    // Attributes
    // ----------

    phoneId: DS.attr('number'),
    // if has phone, string phone number
    phone: DS.attr('phone-number'),
    awayMessage: DS.attr('string', {
        defaultValue: ''
    }),

    // Not attributes
    // --------------

    newPhone: null,
    contacts: null,

    // Computed properties
    // -------------------

    hasNewPhone: notEmpty('newPhone'),
    hasManualChanges: notEmpty('newPhone'),
});
