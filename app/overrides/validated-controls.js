import TextField from '@ember/component/text-field';
import TextArea from '@ember/component/text-area';
import SupportsValidation from 'textup-frontend/mixins/component/supports-validation';

TextArea.reopen(SupportsValidation);
TextField.reopen(SupportsValidation);
