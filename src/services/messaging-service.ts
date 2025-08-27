
import axios from 'axios';

export type MessageChannel = 'email' | 'sms' | 'push' | 'whatsapp';

export interface ChannelConfig {
  apiKey: string;
  fromAddress?: string;
  endpoint?: string;
  templateId?: string;
}

export interface MessagePayload {
  recipient: string;
  subject?: string;
  body: string;
  offerData?: any;
}

class MessagingService {
  private static instance: MessagingService;
  private channelConfigs: Map<MessageChannel, ChannelConfig>;
  
  private constructor() {
    this.channelConfigs = new Map();
  }

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  public configureChannel(channel: MessageChannel, config: ChannelConfig): void {
    this.channelConfigs.set(channel, config);
    console.log(`Configured ${channel} channel with ${config.apiKey ? 'valid' : 'invalid'} API key`);
  }

  public isChannelConfigured(channel: MessageChannel): boolean {
    return this.channelConfigs.has(channel) && !!this.channelConfigs.get(channel)?.apiKey;
  }

  public async sendMessage(channel: MessageChannel, payload: MessagePayload): Promise<boolean> {
    if (!this.isChannelConfigured(channel)) {
      console.error(`Channel ${channel} is not configured`);
      return false;
    }

    const config = this.channelConfigs.get(channel)!;

    try {
      switch (channel) {
        case 'email':
          return await this.sendEmail(config, payload);
        case 'sms':
          return await this.sendSMS(config, payload);
        case 'push':
          return await this.sendPushNotification(config, payload);
        case 'whatsapp':
          return await this.sendWhatsApp(config, payload);
        default:
          console.error(`Unsupported channel: ${channel}`);
          return false;
      }
    } catch (error) {
      console.error(`Error sending message via ${channel}:`, error);
      return false;
    }
  }

  // Email implementation (e.g., SendGrid)
  private async sendEmail(config: ChannelConfig, payload: MessagePayload): Promise<boolean> {
    try {
      // This would be replaced with actual SendGrid API call
      console.log(`Sending email to ${payload.recipient} from ${config.fromAddress}`);
      
      // Mock API call example
      /*
      await axios.post('https://api.sendgrid.com/v3/mail/send', {
        personalizations: [{ to: [{ email: payload.recipient }] }],
        from: { email: config.fromAddress },
        subject: payload.subject || 'Your Special Offer',
        content: [{ type: 'text/html', value: payload.body }]
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // SMS implementation (e.g., Twilio)
  private async sendSMS(config: ChannelConfig, payload: MessagePayload): Promise<boolean> {
    try {
      // This would be replaced with actual Twilio API call
      console.log(`Sending SMS to ${payload.recipient} from ${config.endpoint}`);
      
      // Mock API call example
      /*
      await axios.post(`https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json`, 
        new URLSearchParams({
          To: payload.recipient,
          From: config.endpoint || '',
          Body: payload.body
        }), 
        {
          auth: {
            username: 'ACCOUNT_SID',
            password: config.apiKey
          }
        }
      );
      */
      
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Push notification implementation (e.g., Firebase Cloud Messaging)
  private async sendPushNotification(config: ChannelConfig, payload: MessagePayload): Promise<boolean> {
    try {
      // This would be replaced with actual FCM API call
      console.log(`Sending push notification to token/topic ${payload.recipient}`);
      
      // Mock API call example
      /*
      await axios.post('https://fcm.googleapis.com/fcm/send', {
        to: payload.recipient,
        notification: {
          title: payload.subject || 'Special Offer',
          body: payload.body
        },
        data: payload.offerData
      }, {
        headers: {
          'Authorization': `key=${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // WhatsApp implementation (e.g., Twilio WhatsApp API)
  private async sendWhatsApp(config: ChannelConfig, payload: MessagePayload): Promise<boolean> {
    try {
      // This would be replaced with actual Twilio WhatsApp API call
      console.log(`Sending WhatsApp message to ${payload.recipient} from ${config.fromAddress}`);
      
      // Mock API call example
      /*
      await axios.post(`https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json`, 
        new URLSearchParams({
          To: `whatsapp:${payload.recipient}`,
          From: `whatsapp:${config.fromAddress}`,
          Body: payload.body
        }), 
        {
          auth: {
            username: 'ACCOUNT_SID',
            password: config.apiKey
          }
        }
      );
      */
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }
}

export default MessagingService;
