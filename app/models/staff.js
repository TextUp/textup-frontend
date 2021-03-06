import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasReadableIdentifier from 'textup-frontend/mixins/model/has-readable-identifier';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import OwnsPhone, { OwnsPhoneValidations } from 'textup-frontend/mixins/model/owns-phone';
import { validator, buildValidations } from 'ember-cp-validations';

const { isPresent, computed, assign } = Ember,
  Validations = buildValidations(
    assign(
      {
        name: { description: 'Name', validators: [validator('presence', true)] },
        username: {
          description: 'Username',
          validators: [
            validator('presence', true),
            validator('format', {
              regex: /^[-_=@.,;A-Za-z0-9]+$/,
              message:
                'Usernames may not have spaces and can only include letters, numbers and the following symbols - _ = @ . , ;',
            }),
          ],
        },
        lockCode: {
          description: 'Lock Code',
          validators: [validator('length', { is: 4, allowNone: true, allowBlank: true })],
        },
        email: { description: 'Email', validators: [validator('format', { type: 'email' })] },
      },
      OwnsPhoneValidations
    )
  );

export default DS.Model.extend(
  Dirtiable,
  HasReadableIdentifier,
  HasUrlIdentifier,
  OwnsPhone,
  Validations,
  {
    authService: Ember.inject.service(),

    // Overrides
    // ---------

    rollbackAttributes() {
      this.set('isSelected', false);
      return this._super(...arguments);
    },
    didUpdate() {
      this._super(...arguments);
      this.rollbackAttributes();
    },
    hasManualChanges: computed.alias('ownsPhoneHasManualChanges'),

    // Properties
    // ----------

    // usually blank, for account creation or password change
    password: DS.attr('string', { defaultValue: '' }),
    // usually blank, for account creation or lockCode change
    lockCode: DS.attr('string', { defaultValue: '' }),

    username: DS.attr('string'),
    name: DS.attr('string'),
    channelName: DS.attr('string'),

    email: DS.attr('string'),
    org: DS.belongsTo('organization'),
    shouldAddToGeneralUpdatesList: DS.attr('boolean', { defaultValue: false }),
    isSelected: false,

    [Constants.PROP_NAME.SHARING_IDENT]: computed.alias('phone.content.id'),
    transferFilter: computed('name', 'username', 'email', function() {
      const name = this.get('name'),
        username = this.get('username'),
        email = this.get('email');
      return `${name},${username},${email}`;
    }),
    isAuthUser: computed('authService.authUser.id', 'id', function() {
      const authId = this.get('authService.authUser.id');
      return isPresent(authId) && authId === this.get('id');
    }),

    personalNumber: DS.attr('phone-number'),
    hasPersonalNumber: computed.notEmpty('personalNumber'),

    status: DS.attr('string'),
    isBlocked: computed.equal('status', Constants.STAFF.STATUS.BLOCKED),
    isPending: computed.equal('status', Constants.STAFF.STATUS.PENDING),
    isStaff: computed.equal('status', Constants.STAFF.STATUS.STAFF),
    isAdmin: computed.equal('status', Constants.STAFF.STATUS.ADMIN),

    teams: DS.hasMany('team'),
    hasTeams: computed.notEmpty('teams'),

    allActivePhoneOwners: computed('phone.content.isActive', '_teamsWithPhones.[]', function() {
      const phoneOwners = this.get('phone.content.isActive') ? [this] : [];
      phoneOwners.addObjects(this.get('_teamsWithPhones'));
      return phoneOwners;
    }),

    // Methods
    // -------

    isAnyStatus(raw) {
      return ArrayUtils.ensureArrayAndAllDefined(raw)
        .map(stat => String(stat).toLowerCase())
        .contains(String(this.get('status')).toLowerCase());
    },
    makeStaff() {
      if (!this.get('isAuthUser')) {
        this.set('status', Constants.STAFF.STATUS.STAFF);
      }
    },
    makeAdmin() {
      if (!this.get('isAuthUser')) {
        this.set('status', Constants.STAFF.STATUS.ADMIN);
      }
    },
    block() {
      if (!this.get('isAuthUser')) {
        this.set('status', Constants.STAFF.STATUS.BLOCKED);
      }
    },

    // Internal properties
    // -------------------

    _teamPhones: computed('teams.@each.phone', function() {
      return ArrayUtils.ensureArrayAndAllDefined(this.get('teams').mapBy('phone.content'));
    }),
    _teamsWithPhones: computed('teams.[]', '_teamPhones.@each.isActive', function() {
      // need to call `_teamPhones`` because a single `@each` only works one level deep
      return this.get('_teamPhones').isAny('isActive', true)
        ? this.get('teams').filterBy('phone.content.isActive', true)
        : [];
    }),
  }
);
