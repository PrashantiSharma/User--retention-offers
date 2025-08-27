import fetch from 'node-fetch';

class ShopifyService {
  constructor() {
    this.apiVersion = '2024-01';
    this.isInitialized = false;
  }

  async initializeStore(shopUrl, accessToken) {
    try {
      // Clean up the shop URL
      this.shopUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      this.accessToken = accessToken;
      this.baseUrl = `https://${this.shopUrl}/admin/api/${this.apiVersion}`;

      // Validate the connection
      const response = await fetch(`${this.baseUrl}/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errors || `HTTP error! status: ${response.status}`);
      }

      const shop = await response.json();
      this.isInitialized = true;
      return shop;
    } catch (error) {
      this.isInitialized = false;
      throw new Error(`Failed to initialize Shopify connection: ${error.message}`);
    }
  }

  validateConnection() {
    if (!this.isInitialized) {
      throw new Error('Shopify service not initialized. Please connect to a store first.');
    }
  }

  async getCustomers(page = 1, limit = 50) {
    try {
      this.validateConnection();

      // Build query with cursor-based pagination
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        fields: 'id,email,first_name,last_name,phone,orders_count,total_spent,last_order_id,created_at,updated_at'
      });

      // If we're not on the first page, we should have stored the next page link
      if (page > 1 && this.nextPageUrl) {
        const response = await fetch(this.nextPageUrl, {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        return this.processCustomersResponse(data, response);
      }

      const response = await fetch(
        `${this.baseUrl}/customers.json?${queryParams}`,
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      return this.processCustomersResponse(data, response);
    } catch (error) {
      console.error('Error fetching Shopify customers:', error);
      throw error;
    }
  }

  processCustomersResponse(data, response) {
    if (!response.ok) {
      console.error('Shopify API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      let errorMessage = 'Failed to fetch customers';
      if (data.errors) {
        errorMessage = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      }
      throw new Error(errorMessage);
    }

    if (!data.customers) {
      console.error('Unexpected Shopify API response:', data);
      throw new Error('Invalid response format from Shopify API');
    }

    // Store next page URL if available from Link header
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
      if (nextLink) {
        this.nextPageUrl = nextLink.split(';')[0].trim().slice(1, -1);
      } else {
        this.nextPageUrl = null;
      }
    }

    // Transform the data to match our interface
    return data.customers.map(customer => ({
      id: customer.id.toString(),
      email: customer.email,
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone: customer.phone || '',
      metrics: {
        totalOrders: customer.orders_count || 0,
        totalSpent: parseFloat(customer.total_spent) || 0,
        averageOrderValue: customer.orders_count ? (parseFloat(customer.total_spent) / customer.orders_count) : 0,
        lastOrderDate: null // We'll update this with getCustomerMetrics
      }
    }));
  }

  async getCustomerOrders(customerId) {
    try {
      this.validateConnection();

      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/orders.json?status=any&limit=1`,
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errors || `Failed to fetch customer orders: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  async getCustomerMetrics(customerId) {
    try {
      this.validateConnection();
      const orders = await this.getCustomerOrders(customerId);
      
      return {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0) / orders.length 
          : 0,
        lastOrderDate: orders.length > 0 ? orders[0].created_at : null
      };
    } catch (error) {
      console.error('Error calculating customer metrics:', error);
      throw error;
    }
  }

  // Helper method to validate shop URL format
  static validateShopUrl(url) {
    const shopUrlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    return shopUrlPattern.test(url);
  }

  // Helper method to validate access token format
  static validateAccessToken(token) {
    const accessTokenPattern = /^shpat_[a-fA-F0-9]{32}$/;
    return accessTokenPattern.test(token);
  }
}

export default new ShopifyService(); 