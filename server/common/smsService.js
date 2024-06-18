import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const sendSms = async (receiver, message) => {
  return await client.messages
    .create({
      from: '+12093179872',
      body: message,
      to: receiver,
    })
    .then((message) => console.log(message));
};

export default sendSms;
