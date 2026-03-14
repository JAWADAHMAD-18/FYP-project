// config/brevo.config.js
// Brevo (formerly Sendinblue) SDK configuration for TripFusion email notifications

import SibApiV3Sdk from "sib-api-v3-sdk";

const brevoClient = SibApiV3Sdk.ApiClient.instance;

// Authenticate via API Key from .env
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Transactional email API instance — reused across all email sends
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

export { transactionalEmailsApi, SibApiV3Sdk };
