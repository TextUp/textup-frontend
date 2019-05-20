import TextField from '@ember/component/text-field';
import TextArea from '@ember/component/text-area';
import SupportsMaxLength from 'textup-frontend/mixins/component/supports-max-length';

// Extending _buildCurrentValueLength is mandatory for SupportsMaxLength
const _buildCurrentValueLength = function() {
  return this.$().val().length;
};
TextArea.reopen(SupportsMaxLength, { _buildCurrentValueLength });
TextField.reopen(SupportsMaxLength, { _buildCurrentValueLength });
