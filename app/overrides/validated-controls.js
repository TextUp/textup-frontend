import Ember from 'ember';
import SupportsValidation from 'textup-frontend/mixins/component/supports-validation';

Ember.TextArea.reopen(SupportsValidation);
Ember.TextField.reopen(SupportsValidation);
