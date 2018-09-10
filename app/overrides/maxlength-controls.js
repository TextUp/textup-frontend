import Ember from 'ember';
import HasMaxLength from 'textup-frontend/mixins/component/has-maxlength';

Ember.TextArea.reopen(HasMaxLength);
Ember.TextField.reopen(HasMaxLength);
