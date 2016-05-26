export default function() {
	this.transition(
		this.hasClass('main-outlet'),
		this.use('toLeft')
	);
	// signup
	this.transition(
		this.toRoute('signup.index'),
		this.use('toRight')
	);
	this.transition(
		this.fromRoute('signup.index'),
		this.use('toLeft')
	);
	this.transition(
		this.fromRoute('signup.new'),
		this.toRoute('signup.account'),
		this.use('toLeft')
	);
	// setup
	this.transition(
		this.toRoute('setup.index'),
		this.use('toRight')
	);
	this.transition(
		this.fromRoute('setup.index'),
		this.use('toLeft')
	);
	// effects
	this.transition(
		this.hasClass('animate-slide-from-left'),
		this.toValue(true),
		this.use('toRight'),
		this.reverse('toLeft')
	);
	this.transition(
		this.hasClass('animate-slide-from-right'),
		this.toValue(true),
		this.use('toLeft'),
		this.reverse('toRight')
	);
	this.transition(
		this.hasClass('animate-slide-from-top'),
		this.toValue(true),
		this.use('toDown'),
		this.reverse('toUp')
	);
}
