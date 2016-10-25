import iNoBounce from 'npm:inobounce'; // import to allow enable detection inside script to run

// from https://www.bennadel.com/blog/1950-detecting-iphone-s-app-mode-
// 		full-screen-mode-for-web-applications.htm
export function initialize( /* application */ ) {
	if (("standalone" in window.navigator) && !window.navigator.standalone) {
		iNoBounce.disable();
	}
}

export default {
	name: 'no-bounce',
	initialize
};
