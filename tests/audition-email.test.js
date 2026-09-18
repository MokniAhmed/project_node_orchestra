const { it } = require('node:test');
const assert = require('node:assert/strict');

it('builds the existing audition confirmation payload', () => {
  const buildAuditionConfirmationEmail = require('../utils/auditionEmail');
  const auditionDate = new Date('2024-06-10T09:00:00.000Z');
  const payload = buildAuditionConfirmationEmail({
    email: 'candidate@example.test',
    firstName: 'Amina',
    auditionDate,
  });

  assert.equal(payload.email, 'candidate@example.test');
  assert.equal(payload.subject, 'Audition Schedule Confirmation');
  assert.equal(payload.message, 'Your audition is confirmed. Please see the details below.');
  assert.match(payload.html, /Hello Amina,/);
  assert.ok(payload.html.includes(auditionDate.toLocaleString()));
});
