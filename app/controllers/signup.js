import Controller from '@ember/controller';

// [NOTE] even though this controller is a placeholder, we need to explicitly declare it for
// injection to work in the `signup.index` controller

export default Controller.extend({
  staff: null,
  selected: null,
});
