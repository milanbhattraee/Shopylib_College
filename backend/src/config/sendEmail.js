// Preferring Brevo (formerly Sendinblue) for transactional emails
// This file is responsible for sending emails using Brevo's API

// We will use the native 'fetch' or a library like 'node-fetch' if running in Node.js outside a modern environment
// For this example, I'll assume a 'fetch' function is available (either native or imported).
// If you are using an older Node.js version, you might need:
// import fetch from "node-fetch";

const ApiKey = process.env.BREVO_API_KEY; 

const allowedEmails = ["ujjwalint22@gmail.com", "milanbhattarai0007@gmail.com"];

export async function sendMail(mailOptions) {

  console.log("Preparing to send email to:", mailOptions.to);
  
  // Brevo API expects 'status' to be defined for the check to work
  if (
    process.env.status === "development" && 
    !allowedEmails.includes(mailOptions.to)
  ) {
    console.log("Email is not sent as it is not sent to an allowed email");
    return;
  }

  // Check for the API Key
  if (!ApiKey) {
    console.error("Brevo API Key is not set in environment variables.");
    return;
  }

  const emailData = {
    // Sender information
    sender: {
      email: process.env.EMAIL_FROM,
      name: process.env.COMPANY_NAME, // Optional, but good practice
    },
    // Recipient(s)
    to: [
      {
        email: mailOptions.to,
        name: mailOptions.to, // Optional
      },
    ],
    subject: mailOptions.subject,
    htmlContent: mailOptions.html, // Brevo uses 'htmlContent' for the HTML body
  };

  try {
    console.log("mail option from arguments :", mailOptions);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": ApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log(response,"resposne from brevo");

    const result = await response.json(); // Read the response body

    if (response.ok) {
      if (process.env.status === "development") {
        console.log("Email sent successfully using Brevo in development mode. Message ID:", result.messageId);
      } else {
        console.log("Email sent successfully using Brevo.");
      }
    } else {
      // Handle API errors (e.g., invalid API key, malformed request)
      console.error("Email failed to send via Brevo. Status:", response.status, "Error details:", result);
    }
  } catch (error) {
    // Handle network errors
    console.error("Network or fetch error during Brevo API call:", error);
  }
}