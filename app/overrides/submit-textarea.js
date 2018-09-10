import Ember from 'ember';
import CanSubmitOnNewline from 'textup-frontend/mixins/component/can-submit-on-newline';

Ember.TextArea.reopen(CanSubmitOnNewline);
