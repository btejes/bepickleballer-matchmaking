const formData = require('form-data');
const Mailgun = require('mailgun.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const DOMAIN = process.env.MAILGUN_DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

function sendLoginEmail(email, link) {
  const templatePath = path.join(process.cwd(), 'emailTemplates', 'magicLinkEmail.html');
  let template = fs.readFileSync(templatePath, 'utf8');
  template = template.replace('{{verifyUrl}}', link);

  const data = {
    from: `Be Pickle Baller <noreply@${DOMAIN}>`,
    to: email,
    subject: 'Login to Your Account',
    html: template
  };

  return new Promise((resolve, reject) => {
    client.messages.create(DOMAIN, data)
      .then(body => {
        resolve(body);
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = { sendLoginEmail };
