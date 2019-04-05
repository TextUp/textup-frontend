import { moduleForComponent, test } from 'ember-qunit';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tour-components/hint', 'Integration | Component | tour components/hint', {
  integration: true,
  beforeEach() {
    this.register('service:notifications', NotificationsService);
  }
});

test('it renders', function(assert) {
  // Template block usage:
  this.setProperties({
    hintId: 'testHint1'
  });
  this.render(hbs`
    {{#tour-components/hint hintId=hintId}}
      template block text
    {{/tour-components/hint}}
  `);

  assert.ok(
    this.$()
      .text()
      .includes('template block text')
  );

  assert.ok(
    this.$()
      .text()
      .includes(
        'This is a super super super super super super super super super super super super long test hint'
      )
  );
});
