import { helper as buildHelper } from '@ember/component/helper';

export function plus(params /*, hash*/ ) {
	const parsedNum = parseInt(params[0]),
		parsedToAdd = parseInt(params[1]);
	return (!isNaN(parsedNum) && !isNaN(parsedToAdd)) ? (parsedNum + parsedToAdd) : params[0];
}

export default buildHelper(plus);
