import Constants from 'textup-frontend/constants';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';
import Ember from 'ember';

export default Ember.Component.extend({
  singleOptions: defaultIfAbsent([
    {
      display: 'Not Shared',
      command: Constants.ACTION.SHARE.STOP,
      color: Constants.COLOR.LIGHT_GRAY,
    },
    {
      display: 'View',
      command: Constants.SHARING_PERMISSION.VIEW,
      color: Constants.COLOR.LIGHT_BLUE,
    },
    {
      display: 'Collaborate',
      command: Constants.SHARING_PERMISSION.DELEGATE,
      color: Constants.COLOR.BRAND,
    },
  ]),
  multipleOptions: defaultIfAbsent([
    {
      display: 'Stop Sharing',
      command: Constants.ACTION.SHARE.STOP,
      color: Constants.COLOR.RED,
    },
    {
      display: 'View',
      command: Constants.SHARING_PERMISSION.VIEW,
      color: Constants.COLOR.LIGHT_BLUE,
    },
    {
      display: 'Collaborate',
      command: Constants.SHARING_PERMISSION.DELEGATE,
      color: Constants.COLOR.BRAND,
    },
  ]),
});
