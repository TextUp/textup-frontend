import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import OwnsPhone, { OwnsPhoneValidations } from 'textup-frontend/mixins/model/owns-phone';
import { validator, buildValidations } from 'ember-cp-validations';

const { isPresent, isArray, computed, RSVP, tryInvoke, getWithDefault, assign } = Ember,
  Validations = buildValidations(
    assign(OwnsPhoneValidations, {
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
      phone: { description: 'Phone', validators: [validator('belongs-to')] },
    })
  );

export default DS.Model.extend(Dirtiable, Validations, OwnsPhone, {
  constants: Ember.inject.service(),
  authService: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes() {
    this.set('isSelected', false);
    this.set('enableNotifications', isPresent(this.get('personalPhoneNumber')));
    tryInvoke(getWithDefault(this, 'schedule.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  didUpdate() {
    this._super(...arguments);
    this.rollbackAttributes();
  },
  hasManualChanges: computed('ownsPhoneHasManualChanges', 'schedule.isDirty', function() {
    return this.get('ownsPhoneHasManualChanges') || !!this.get('schedule.isDirty');
  }),

  // Properties
  // ----------

  username: DS.attr('string'),
  name: DS.attr('string'),
  // usually blank, for account creation or password change
  password: DS.attr('string', { defaultValue: '' }),
  // usually blank, for account creation or lockCode change
  lockCode: DS.attr('string', { defaultValue: '' }),
  // usually blank, for account creation
  captcha: DS.attr('string', { defaultValue: '' }),
  email: DS.attr('string'),
  org: DS.belongsTo('organization'),
  type: computed.readOnly('constants.MODEL.STAFF'),
  isSelected: false,

  urlIdentifier: computed('username', function() {
    return Ember.String.dasherize(this.get('username') || '');
  }),
  sharingId: computed.alias('phone.content.id'), // for building share actions
  transferFilter: computed('name', 'username', 'email', function() {
    const name = this.get('name'),
      username = this.get('username'),
      email = this.get('email');
    return `${name},${username},${email}`;
  }),
  isAuthUser: computed('authService.authUser', function() {
    return this.get('authService.authUser.id') === this.get('id');
  }),

  schedule: DS.belongsTo('schedule'),
  manualSchedule: DS.attr('boolean', { defaultValue: true }),
  isAvailable: DS.attr('boolean', { defaultValue: true }),

  personalPhoneNumber: DS.attr('phone-number'),
  enableNotifications: computed('personalPhoneNumber', {
    get() {
      return isPresent(this.get('personalPhoneNumber'));
    },
    set(key, value) {
      if (this.get('isDeleted') === false) {
        if (value === false) {
          this.set('personalPhoneNumber', '');
        } else if (value === true) {
          const changes = this.changedAttributes()['personalPhoneNumber'];
          if (isArray(changes)) {
            this.set('personalPhoneNumber', changes[0]);
          }
        }
      }
      return value;
    },
  }),

  status: DS.attr('string'),
  isBlocked: computed.equal('status', 'BLOCKED'),
  isPending: computed.equal('status', 'PENDING'),
  isStaff: computed.equal('status', 'STAFF'),
  isAdmin: computed.equal('status', 'ADMIN'),

  teams: DS.hasMany('team'),
  hasTeams: computed.notEmpty('teams'),
  teamsWithPhones: computed('teams.[]', function() {
    return DS.PromiseArray.create({
      promise: new RSVP.Promise((resolve, reject) => {
        this.get('teams').then(teams => {
          RSVP.all(teams.mapBy('phone.content')).then(phones => {
            const teamsWithPhones = [];
            phones.forEach((phone, index) => {
              if (isPresent(phone)) {
                teamsWithPhones.pushObject(teams.objectAt(index));
              }
            });
            resolve(teamsWithPhones);
          });
        }, reject);
      }),
    });
  }),
  isNone: computed('isBlocked', 'isPending', 'teamsWithPhones', 'phone', function() {
    return new RSVP.Promise((resolve, reject) => {
      this.get('teamsWithPhones').then(teams => {
        this.get('phone').then(phone => {
          const isBlocked = this.get('isBlocked'),
            isPending = this.get('isPending'),
            hasPhone = isPresent(phone);
          // isNone is true when user is blocked OR pending OR
          // if the user is active, but
          //    (1) does not have phone,
          //    (2) is not part of team that has a phone,
          resolve(isBlocked || isPending || (!hasPhone && !teams.length));
        });
      }, reject);
    });
  }),

  // Methods
  // -------

  isAnyStatus(raw) {
    return (isArray(raw) ? raw : [raw])
      .map(stat => String(stat).toLowerCase())
      .contains(String(this.get('status')).toLowerCase());
  },
  makeStaff() {
    if (!this.get('isAuthUser')) {
      this.set('status', 'STAFF');
    }
  },
  makeAdmin() {
    if (!this.get('isAuthUser')) {
      this.set('status', 'ADMIN');
    }
  },
  block() {
    if (!this.get('isAuthUser')) {
      this.set('status', 'BLOCKED');
    }
  },
});
