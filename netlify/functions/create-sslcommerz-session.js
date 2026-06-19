export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const plan = await request.json();

    const siteUrl = process.env.SITE_URL || 'http://localhost:5173';
    const tranId = `MTS-${Date.now()}`;

    const payload = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: plan.price,
      currency: plan.currency || 'BDT',
      tran_id: tranId,
      success_url: `${siteUrl}/.netlify/functions/sslcommerz-success`,
      fail_url: `${siteUrl}/pricing?payment=failed`,
      cancel_url: `${siteUrl}/pricing?payment=cancelled`,
      ipn_url: `${siteUrl}/.netlify/functions/sslcommerz-ipn`,
      shipping_method: 'NO',
      product_name: `${plan.name} Plan`,
      product_category: 'Subscription',
      product_profile: 'general',
      cus_name: 'MT Studio Customer',
      cus_email: 'customer@example.com',
      cus_add1: 'N/A',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '0000000000',
      value_a: plan.id,
      value_b: plan.credits,
      value_c: 'mt-studio',
      value_d: 'react-vite'
    };

    const endpoint = process.env.SSLCOMMERZ_SANDBOX === 'true'
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload).toString(),
    });

    const data = await res.json();

    if (!data?.GatewayPageURL) {
      throw new Error(data?.failedreason || 'Failed to create SSLCommerz session');
    }

    return new Response(
      JSON.stringify({
        success: true,
        gatewayUrl: data.GatewayPageURL,
        session: data,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};