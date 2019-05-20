import { helper as buildHelper } from '@ember/component/helper';
import moment from 'moment';

export function dateIsSameDay([date1, date2] /*, hash*/ ) {
    return moment(date1).isSame(date2, 'day');
}

export default buildHelper(dateIsSameDay);