import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'model-fragments';

export default MF.Fragment.extend(Dirtiable, {
  frequency: DS.attr('string'),
  level: DS.attr('string'),
  method: DS.attr('string'),
  name: DS.attr('string'),
  schedule: MF.fragment('schedule'),
  shouldSendPreviewLink: DS.attr('boolean'),
  staffId: DS.attr('string'),
});
