import { postFunction } from './http';

export async function startSSLCommerzCheckout(plan) {
  const data = await postFunction('create-sslcommerz-session', plan);

  if (!data?.gatewayUrl) {
    throw new Error('Payment gateway URL not received');
  }

  window.location.href = data.gatewayUrl;
}

export async function startStripeCheckout(plan) {
  const data = await postFunction('create-stripe-session', plan);

  if (!data?.url) {
    throw new Error('Stripe checkout URL not received');
  }

  window.location.href = data.url;
}