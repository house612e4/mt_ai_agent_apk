import { getBkashToken } from './_bkash.js';

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { orderId, plan, customer } = await request.json();
    const token = await getBkashToken();
    const baseUrl = process.env.BKASH_BASE_URL;
    const siteUrl = process.env.SITE_URL || 'http://localhost:5173';

    const res = await fetch(`${baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: token,
        'x-app-key': process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: customer?.payerReference || 'guest-user',
        callbackURL: `${siteUrl}/.netlify/functions/bkash-callback`,
        amount: String(plan.price),
        currency: plan.currency || 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.bkashURL) {
      throw new Error(data?.statusMessage || data?.message || 'Failed to create bKash payment');
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};