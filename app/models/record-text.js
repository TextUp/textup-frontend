import DS from 'ember-data';
import RecordItem from './record-item';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  numRecipients: validator('number', {
    gt: 0,
    message: 'should have at least one recipient'
  }),
  contents: validator('has-any', {
    also: ['media.hasElements'],
    // see `valdiators/has-any` for why we need to manually specify dependent key here
    dependentKeys: ['media.hasElements'],
    description: 'contents or images'
  })
});

export default RecordItem.extend(Validations, {
  contents: DS.attr('string')
});
