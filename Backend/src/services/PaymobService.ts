import https from 'https';

export type PaymobAuthResponse = {
  token: string;
};

export type PaymobCreateOrderResponse = {
  id: number;
};

export type PaymobPaymentKeyResponse = {
  token: string;
};

export type PaymobBillingData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  shipping_method: string;
  postal_code: string;
  city: string;
  country: string;
  state: string;
};

type Json = Record<string, unknown>;

function postJson<TResponse>(url: string, body: Json): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);

    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          const statusCode = res.statusCode ?? 0;
          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`Paymob request failed (${statusCode}): ${raw}`));
            return;
          }

          try {
            resolve(JSON.parse(raw) as TResponse);
          } catch {
            reject(new Error(`Failed to parse Paymob response: ${raw}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export class PaymobService {
  private apiBase = 'https://accept.paymob.com/api';

  private getApiKey(): string {
    const key = process.env.PAYMOB_API_KEY;
    if (!key) throw new Error('Missing PAYMOB_API_KEY');
    return key;
  }

  private getIntegrationId(): number {
    const v = process.env.PAYMOB_INTEGRATION_ID;
    if (!v) throw new Error('Missing PAYMOB_INTEGRATION_ID');
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error('Invalid PAYMOB_INTEGRATION_ID');
    return n;
  }

  private getIframeId(): number {
    const v = process.env.PAYMOB_IFRAME_ID;
    if (!v) throw new Error('Missing PAYMOB_IFRAME_ID');
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error('Invalid PAYMOB_IFRAME_ID');
    return n;
  }

  async authenticate(): Promise<string> {
    const res = await postJson<PaymobAuthResponse>(`${this.apiBase}/auth/tokens`, {
      api_key: this.getApiKey(),
    });

    return res.token;
  }

  async createOrder(params: {
    authToken: string;
    amountCents: number;
    merchantOrderId: string;
    currency?: string;
  }): Promise<number> {
    const res = await postJson<PaymobCreateOrderResponse>(`${this.apiBase}/ecommerce/orders`, {
      auth_token: params.authToken,
      delivery_needed: false,
      amount_cents: String(params.amountCents),
      currency: params.currency || 'EGP',
      merchant_order_id: params.merchantOrderId,
      items: [],
    });

    return res.id;
  }

  async createPaymentKey(params: {
    authToken: string;
    amountCents: number;
    orderId: number;
    billingData: PaymobBillingData;
    currency?: string;
  }): Promise<string> {
    const res = await postJson<PaymobPaymentKeyResponse>(`${this.apiBase}/acceptance/payment_keys`, {
      auth_token: params.authToken,
      amount_cents: String(params.amountCents),
      expiration: 3600,
      order_id: params.orderId,
      billing_data: params.billingData,
      currency: params.currency || 'EGP',
      integration_id: this.getIntegrationId(),
      lock_order_when_paid: false,
    });

    return res.token;
  }

  buildIframeUrl(paymentKey: string): string {
    const iframeId = this.getIframeId();
    return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${encodeURIComponent(paymentKey)}`;
  }
}
