import TextArea from '@ember/component/text-area';
import CanSubmitOnNewline from 'textup-frontend/mixins/component/can-submit-on-newline';

TextArea.reopen(CanSubmitOnNewline);
