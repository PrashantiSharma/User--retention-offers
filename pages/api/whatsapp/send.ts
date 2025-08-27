import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

// Define the Offer type locally since we can't import from client-side code in API routes
interface Offer {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bundle' | 'freeShipping';
  value: number;
  description: string;
}

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

interface WhatsAppRequest {
  to: string;
  offer: Offer;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, offer } = req.body as WhatsAppRequest;

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
} 