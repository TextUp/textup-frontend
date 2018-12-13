import Ember from 'ember';
import SupportsMaxLength from 'textup-frontend/mixins/component/supports-max-length';

// Extending _buildCurrentValueLength is mandatory for SupportsMaxLength
const _buildCurrentValueLength = function() {
  return this.$().val().length;
};
Ember.TextArea.reopen(SupportsMaxLength, { _buildCurrentValueLength });
Ember.TextField.reopen(SupportsMaxLength, { _buildCurrentValueLength });
