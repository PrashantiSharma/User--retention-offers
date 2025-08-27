import { Offer } from '@/components/offers/OfferManager';

export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async sendOffer(phoneNumber: string, offer: Offer): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
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
        const error = await response.json();
        console.error('WhatsApp API error:', error);
        throw new Error(error.error || 'Failed to send WhatsApp message');
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