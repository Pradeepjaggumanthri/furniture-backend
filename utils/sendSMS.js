const axios = require("axios");

const sendSMS = async (mobile, otp) => {
  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        variables_values: otp,
        numbers: mobile
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.log("SMS Error:", error.message);
  }
};

module.exports = sendSMS;
