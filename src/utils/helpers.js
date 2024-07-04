import fetch from "node-fetch";
const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  STRAPICMS_ENDPOINT,
  STRAPICMS_TOKEN,
  BASE,
} = process.env;

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");
    const response = await fetch(`${BASE}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

async function fetchOrder(orderId) {
  try {
    const response = await fetch(
      `${STRAPICMS_ENDPOINT}/api/orders/${orderId}?populate=products`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPICMS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return { error: "cannot fetch product" };
    }
    const order = await response.json();

    return order.data.attributes.products.data.map((product) => {
      product = { id: product.id, ...product.attributes };
      return {
        reference_id: product.id,
        amount: {
          currency_code: "USD",
          value: product.price,
        },
      };
    });
  } catch (error) {
    return { error: "cannot fetch product" };
  }
}

export { generateAccessToken, fetchOrder };
