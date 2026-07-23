const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory store of payment status, keyed by CheckoutRequestID.
// Fine for a small single-instance app. If you outgrow this, swap in a real database.
const payments = global.__kdocsPayments || (global.__kdocsPayments = {});

function baseUrl() {
  return process.env.DARAJA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function getAccessToken() {
  const key = process.env.DARAJA_CONSUMER_KEY;
  const secret = process.env.DARAJA_CONSUMER_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await axios.get(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

// Normalize a phone number like 0712345678 or +254712345678 to 254712345678
function normalizePhone(phone) {
  let p = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (p.startsWith('0')) p = '254' + p.slice(1);
  if (p.startsWith('7') || p.startsWith('1')) p = '254' + p;
  return p;
}

// POST /api/daraja/stkpush  { phone, documentId }
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, documentId } = req.body;
    if (!phone || !documentId) {
      return res.status(400).json({ error: 'phone and documentId are required' });
    }

    const token = await getAccessToken();
    const ts = timestamp();
    const password = Buffer.from(
      `${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${ts}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: process.env.DARAJA_SHORTCODE,
      Password: password,
      Timestamp: ts,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Number(process.env.PRICE_KES || 20),
      PartyA: normalizePhone(phone),
      PartyB: process.env.DARAJA_SHORTCODE,
      PhoneNumber: normalizePhone(phone),
      CallBackURL: process.env.DARAJA_CALLBACK_URL,
      AccountReference: 'KDocsPro',
      TransactionDesc: 'KDocs-Pro document download',
    };

    const stkRes = await axios.post(
      `${baseUrl()}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const checkoutRequestId = stkRes.data.CheckoutRequestID;
    payments[checkoutRequestId] = { status: 'pending', documentId };

    res.json({ checkoutRequestId, message: 'Check your phone and enter your M-Pesa PIN.' });
  } catch (err) {
    console.error('STK push error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Could not start the M-Pesa payment. Please try again.' });
  }
});

// Safaricom calls this URL automatically once the customer pays (or cancels)
router.post('/callback', (req, res) => {
  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) return res.json({ ResultCode: 0, ResultDesc: 'ignored' });

    const checkoutRequestId = body.CheckoutRequestID;
    const success = body.ResultCode === 0;

    if (!payments[checkoutRequestId]) payments[checkoutRequestId] = {};
    payments[checkoutRequestId].status = success ? 'paid' : 'failed';
    payments[checkoutRequestId].raw = body;

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('Callback error:', err.message);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// Frontend polls this to find out if the payment went through
router.get('/status/:checkoutRequestId', (req, res) => {
  const record = payments[req.params.checkoutRequestId];
  if (!record) return res.json({ status: 'pending' });
  res.json({ status: record.status, documentId: record.documentId });
});

module.exports = router;
