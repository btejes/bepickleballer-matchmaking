// Import necessary modules
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Load Mailgun domain and API key from environment variables
const DOMAIN = process.env.MAILGUN_DOMAIN ; 
const API_KEY = process.env.MAILGUN_API_KEY;

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

/**
 * Send a login email using Mailgun
 * @param {string} email - Recipient's email address
 * @param {string} link - Magic login link
 * @returns {Promise} - Promise representing the result of the email send operation
 */
function sendLoginEmail(email, link) {
  const data = {
    from: `bepickleballer <mailgun@${DOMAIN}>`, // Use the sandbox domain
    to: email,
    subject: 'Login to Your Account',
    html: `Click <a href="${link}">here</a> to log in. This link will expire in 15 minutes.`
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

// Export the sendLoginEmail function for use in other modules
module.exports = { sendLoginEmail };
