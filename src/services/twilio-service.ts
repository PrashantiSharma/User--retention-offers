import { Offer } from '@/components/offers/OfferManager';

export class TwilioService {
  private static instance: TwilioService;

  private constructor() {
    // We don't need to store these credentials on the client side
    // The API route will handle the actual Twilio integration
  }

  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }

  public async sendWhatsAppMessage(to: string, offer: Offer): Promise<boolean> {
    try {
      // Format the phone number for WhatsApp
      const formattedTo = this.formatPhoneNumber(to);
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedTo,
          offer: {
            id: offer.id,
            name: offer.name,
            type: offer.type,
            value: offer.value,
            description: offer.description
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add WhatsApp prefix if not present
    if (!cleaned.startsWith('whatsapp:')) {
      return `whatsapp:+${cleaned}`;
    }
    return cleaned;
  }
} 