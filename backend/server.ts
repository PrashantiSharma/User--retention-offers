import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import twilio from 'twilio';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// WhatsApp endpoint
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, offer } = req.body;

    if (!to || !offer) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Format the offer message based on type
    let offerText = '';
    switch (offer.type) {
      case 'percentage':
        offerText = `${offer.value}% off`;
        break;
      case 'fixed':
        offerText = `$${offer.value} off`;
        break;
      case 'bundle':
        offerText = `Buy ${offer.value} items deal`;
        break;
      case 'freeShipping':
        offerText = 'Free shipping';
        break;
      default:
        offerText = offer.description;
    }

    // Format the message
    const message = `🎉 Special Offer from Our Store!\n\n${offer.name}\n\n${offerText}\n\n${offer.description}\n\nClick here to redeem: [Store URL]`;

    // Send WhatsApp message using Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    return res.status(200).json({
      success: true,
      messageId: twilioMessage.sid
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
}); 