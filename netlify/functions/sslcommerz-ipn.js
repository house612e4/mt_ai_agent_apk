export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    const valId = params.get('val_id');

    if (!valId) {
      return new Response('Missing val_id', { status: 400 });
    }

    const validationBase =
      process.env.SSLCOMMERZ_SANDBOX === 'true'
        ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
        : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

    const validationUrl =
      `${validationBase}?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_ID)}&store_passwd=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_PASSWORD)}&format=json`;

    const res = await fetch(validationUrl);
    const data = await res.json();

    return new Response(JSON.stringify({ success: true, validation: data }), {
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