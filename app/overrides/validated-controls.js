import Ember from 'ember';
import Validated from '../mixins/validated-component';

Ember.TextArea.reopen(Validated);
Ember.TextField.reopen(Validated);
