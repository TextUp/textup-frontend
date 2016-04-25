import Ember from 'ember';
import Maxlength from '../mixins/maxlength-component';

Ember.TextArea.reopen(Maxlength);
Ember.TextField.reopen(Maxlength);
