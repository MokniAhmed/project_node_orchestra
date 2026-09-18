function buildAuditionConfirmationEmail({ email, firstName, auditionDate }) {
  return {
    email,
    subject: "Audition Schedule Confirmation",
    message: "Your audition is confirmed. Please see the details below.",
    html: `
        <html>
          <head>
            <style>
              .email-container { font-family: Arial, Helvetica, sans-serif; color: #4B5563; background-color: #F9FAFB; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .header { color: #1F2937; font-size: 24px; font-weight: 800; }
              .body-text { margin-bottom: 16px; }
              .strong { font-weight: bold; }
              .footer { margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h1 class="header">Audition Confirmation</h1>
              <p class="body-text">Hello ${firstName},</p>
              <p class="body-text">Thank you for applying for the audition. We are pleased to inform you that your application has been received and scheduled.</p>
              <p class="body-text"><span class="strong">Audition Date and Time:</span> ${auditionDate.toLocaleString()}</p>
              <p class="body-text">Please make sure to arrive on time and prepare any necessary materials for your audition.</p>
              <p class="footer">Best regards,<br>Your Audition Team</p>
            </div>
          </body>
        </html>
      `,
  };
}

module.exports = buildAuditionConfirmationEmail;
