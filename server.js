const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PhonePe Configuration from .env
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_API_URL = process.env.PHONEPE_API_URL;
const PHONEPE_STATUS_URL = process.env.PHONEPE_STATUS_URL;

const { initializeApp: initializeFirebase } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Your web app's Firebase configuration (from USER_REQUEST)
const firebaseConfig = {
  apiKey: "AIzaSyDvYRbRdLGBfKQbBKVz2Pq-iuOonLtHaAE",
  authDomain: "harsha-arts-website.firebaseapp.com",
  projectId: "harsha-arts-website",
  storageBucket: "harsha-arts-website.firebasestorage.app",
  messagingSenderId: "698520096905",
  appId: "1:698520096905:web:08e2373a41c6c8dd0cb658",
  measurementId: "G-HYMSSL5DS6"
};

// Initialize Firebase
const firebaseApp = initializeFirebase(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Storage for orders and carts
const userCarts = {};
const ordersFile = path.join(__dirname, 'orders.json');

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, JSON.stringify([]));
}

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function saveOrder(order) {
  try {
    // 1. Save to local JSON (Backup)
    const orders = JSON.parse(fs.readFileSync(ordersFile));
    orders.push(order);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    console.log('Order saved to local file:', order.transactionId || order.id);

    // 2. Save to Firebase Firestore
    const docRef = await addDoc(collection(db, "orders"), {
      ...order,
      createdAt: new Date().toISOString()
    });
    console.log('Order saved to Firebase Firestore with ID:', docRef.id);
  } catch (err) {
    console.error('Error saving order:', err);
  }
}

// Function to send notifications (Email and WhatsApp)
async function sendNotifications(order) {
  console.log(`--- Sending Notifications for Order: ${order.transactionId || order.id} ---`);

  const orderItemsText = order.items.map(item =>
    `- ${item.productName} (Qty: ${item.quantity}) - Rs.${item.price}`
  ).join('\n');

  // 1. Send Email to Customer
  if (order.email) {
    try {
      console.log(`Attempting to send email to: ${order.email}`);
      await transporter.sendMail({
        from: `"Harsha Arts" <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: `Order Confirmed! ID: ${order.transactionId || order.id}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #28a745; margin-bottom: 5px;">Order Successfully Placed!</h1>
              <p style="color: #666;">Thank you for shopping with Harsha Arts</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Order Summary</h3>
              <p><strong>Order ID:</strong> <span style="color: #28a745;">${order.transactionId || order.id}</span></p>
              <p><strong>Total Amount:</strong> Rs.${order.total}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #444;">Items Ordered</h3>
              <div style="background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 5px;">
                <pre style="margin: 0; font-family: inherit; font-size: 14px; white-space: pre-wrap;">${orderItemsText}</pre>
              </div>
            </div>

            <div style="background: #fff9e6; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>Delivery Address:</strong><br>${order.address}</p>
            </div>

            <p style="margin-top: 30px; font-size: 0.9em; color: #888; text-align: center;">
              We will process your order soon. For any queries, contact us at +91 99088 17179.
            </p>
          </div>
        `
      });
      console.log('✅ Success: Customer Email Sent.');
    } catch (error) {
      console.error('❌ Customer Email Error:', error);
    }
  }

  // 2. Send Email to Admin (Backdoor for order tracking)
  if (process.env.RECEIVER_EMAIL) {
    try {
      await transporter.sendMail({
        from: `"Order Bot" <${process.env.EMAIL_USER}>`,
        to: process.env.RECEIVER_EMAIL,
        subject: `🚨 NEW ORDER: ${order.transactionId || order.id}`,
        html: `
          <h2>New Order Received!</h2>
          <p><strong>Customer Phone:</strong> ${order.phone}</p>
          <p><strong>Customer Email:</strong> ${order.email}</p>
          <p><strong>Total:</strong> Rs.${order.total}</p>
          <p><strong>Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Address:</strong> ${order.address}</p>
          <hr>
          <h3>Items:</h3>
          <pre>${orderItemsText}</pre>
        `
      });
      console.log('✅ Success: Admin Email Sent.');
    } catch (error) {
      console.error('❌ Admin Email Error:', error);
    }
  }

  // 3. WhatsApp Notifications
  const customerMsg = `*Order Placed Successfully!* ✅\n\nHi! Thank you for shopping with *Harsha Arts*.\n\n*Order ID:* ${order.transactionId || order.id}\n*Total:* Rs.${order.total}\n\n*Items Ordered:*\n${orderItemsText}\n\n*Address:*\n${order.address}\n\nWe will process your order soon!`;

  const adminMsg = `📦 *NEW ORDER ALERT!*\n\n*ID:* ${order.transactionId || order.id}\n*Customer:* ${order.phone}\n*Email:* ${order.email || 'N/A'}\n\n*Items:*\n${orderItemsText}\n\n*Total:* Rs.${order.total}\n*Address:* ${order.address}\n\nView on Dashboard: http://localhost:3000/admin.html`;

  const sendWhatsApp = async (phone, message) => {
    if (process.env.WHATSAPP_TOKEN && process.env.PHONE_NUMBER_ID) {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
      const data = JSON.stringify({ messaging_product: "whatsapp", to: cleanPhone, type: "text", text: { body: message } });
      const options = { hostname: 'graph.facebook.com', path: `/v17.0/${process.env.PHONE_NUMBER_ID}/messages`, method: 'POST', headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } };
      const req = https.request(options, (res) => { res.on('data', () => { }); });
      req.on('error', (e) => console.error('❌ Meta API error:', e.message));
      req.write(data);
      req.end();
    } else if (process.env.WHATSAPP_API_KEY) {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${process.env.WHATSAPP_API_KEY}`;
      https.get(url, (res) => { }).on('error', (e) => console.error('❌ CallMeBot error:', e.message));
    }
  };

  // Notify Customer
  if (order.phone) await sendWhatsApp(order.phone, customerMsg);
  // Notify Admin
  if (process.env.WHATSAPP_PHONE || process.env.ADMIN_PHONE) {
    await sendWhatsApp(process.env.WHATSAPP_PHONE || process.env.ADMIN_PHONE, adminMsg);
  }
}

// API Routes

// PhonePe Payment Initiation
app.post('/api/payment/initiate', (req, res) => {
  const { amount, userId, address, phone, email, items } = req.body;
  const transactionId = 'MT' + Date.now();

  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: userId,
    amount: amount * 100, // Amount in paisa
    redirectUrl: `http://localhost:${PORT}/payment-status.html?id=${transactionId}`,
    redirectMode: 'REDIRECT',
    callbackUrl: `http://localhost:${PORT}/api/payment-callback`, // In production, this must be a public URL
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToSign = base64Payload + '/pg/v1/pay' + PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  const checksum = sha256 + '###' + PHONEPE_SALT_INDEX;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'accept': 'application/json'
    }
  };

  const phonepeReq = https.request(PHONEPE_API_URL, options, (phonepeRes) => {
    let data = '';
    phonepeRes.on('data', (chunk) => data += chunk);
    phonepeRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success && response.data.instrumentResponse.redirectInfo.url) {
          // Save temporary order data
          const tempOrder = {
            transactionId,
            userId,
            amount,
            address,
            phone,
            email,
            items,
            status: 'PENDING',
            paymentMethod: 'ONLINE',
            date: new Date().toISOString()
          };
          saveOrder(tempOrder);

          res.json({
            success: true,
            url: response.data.instrumentResponse.redirectInfo.url
          });
        } else {
          res.status(400).json({ success: false, message: 'PhonePe initiation failed', details: response });
        }
      } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    });
  });

  phonepeReq.on('error', (e) => {
    res.status(500).json({ success: false, message: 'PhonePe request error' });
  });

  phonepeReq.write(JSON.stringify({ request: base64Payload }));
  phonepeReq.end();
});

// PhonePe Callback (Called by PhonePe server)
app.post('/api/payment-callback', (req, res) => {
  console.log('Received PhonePe Callback');
  res.status(200).send('OK');
});

// Payment Status Check
app.get('/api/payment/status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`;
  const stringToSign = endpoint + PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  const checksum = sha256 + '###' + PHONEPE_SALT_INDEX;

  const options = {
    method: 'GET',
    headers: {
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
      'accept': 'application/json'
    }
  };

  const statusUrl = `${PHONEPE_STATUS_URL}/${PHONEPE_MERCHANT_ID}/${transactionId}`;

  const phonepeReq = https.request(statusUrl, options, (phonepeRes) => {
    let data = '';
    phonepeRes.on('data', (chunk) => data += chunk);
    phonepeRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success && response.code === 'PAYMENT_SUCCESS') {
          // Update order status and send notifications
          const orders = JSON.parse(fs.readFileSync(ordersFile));
          const orderIndex = orders.findIndex(o => o.transactionId === transactionId);
          if (orderIndex !== -1 && orders[orderIndex].status !== 'COMPLETED') {
            orders[orderIndex].status = 'COMPLETED';
            fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

            // Send notifications only on the first success encounter
            sendNotifications(orders[orderIndex]);
          }
        }
        res.json(response);
      } catch (e) {
        res.status(500).json({ success: false });
      }
    });
  });

  phonepeReq.on('error', (e) => res.status(500).json({ success: false }));
  phonepeReq.end();
});

// Place COD Order
app.post('/api/orders/place', async (req, res) => {
  try {
    const { items, total, address, phone, email, paymentMethod } = req.body;
    const orderId = 'ORD' + Date.now();

    const newOrder = {
      id: orderId,
      items,
      total,
      address,
      phone,
      email,
      paymentMethod,
      status: 'RECEIVED',
      date: new Date().toISOString()
    };

    saveOrder(newOrder);

    // Send notifications immediately for COD
    await sendNotifications(newOrder);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Existing Routes
app.get('/api/cart/:userId', (req, res) => {
  const { userId } = req.params;
  const cart = userCarts[userId] || [];
  res.json({ success: true, cart });
});

app.post('/api/cart/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { productName, price, image } = req.body;
  if (!userCarts[userId]) userCarts[userId] = [];
  const cartItem = { id: Date.now(), productName, price, image, quantity: 1 };
  const existingItem = userCarts[userId].find(item => item.productName === productName);
  if (existingItem) existingItem.quantity += 1;
  else userCarts[userId].push(cartItem);
  res.json({ success: true, cart: userCarts[userId] });
});

app.delete('/api/cart/:userId/remove/:itemId', (req, res) => {
  const { userId, itemId } = req.params;
  if (userCarts[userId]) userCarts[userId] = userCarts[userId].filter(item => item.id !== parseInt(itemId));
  res.json({ success: true, cart: userCarts[userId] || [] });
});

app.delete('/api/cart/:userId/clear', (req, res) => {
  const { userId } = req.params;
  userCarts[userId] = [];
  res.json({ success: true, cart: [] });
});

app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'ANJALI❤', price: 450, image: 'anjali.jpg' },
    { id: 2, name: 'BUDDY❤', price: 500, image: 'buddy.jpg' },
    { id: 3, name: 'Beautiful Couple Names❤', price: 700, image: 'kanna.jpg' },
    { id: 4, name: 'HARSHA❤', price: 450, image: 'harsha.jpg' },
    { id: 5, name: 'VANI❤', price: 300, image: 'vani.jpg' },
    { id: 6, name: 'PRIYA❤', price: 350, image: 'priya.jpg' },
    { id: 7, name: 'SAI❤MANU', price: 500, image: 'saimanu.jpg' },
    { id: 8, name: 'SWATHI❤', price: 450, image: 'swathi.jpg' },
    { id: 9, name: 'HARINI❤', price: 400, image: 'harini.jpg' },
    { id: 10, name: 'BUDDI❤', price: 400, image: 'buddi.jpg' },
    { id: 11, name: 'ESWAR❤', price: 350, image: 'eswar.jpg' },
    { id: 12, name: 'NANA❤AMMU', price: 550, image: 'nanaammu.jpg' }
  ];
  res.json({ success: true, products });
});

app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(ordersFile));
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

