import DS from 'ember-data';
import RecordItem from './record-item';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  numRecipients: validator('inclusion', {
    in: [1],
    message: 'should have exactly one recipient',
  }),
  'contactRecipients.length': validator('has-any', {
    also: ['sharedContactRecipients.length'],
    dependentKeys: ['numRecipients'],
    description: 'a contact or shared contact recipient',
  }),
});

export default RecordItem.extend(Validations, {
  durationInSeconds: DS.attr('number'),
  voicemailInSeconds: DS.attr('number'),
  stillOngoing: DS.attr('boolean', { defaultValue: false }),
  endOngoing: DS.attr('boolean', { defaultValue: false }),
});
