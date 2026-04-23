const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

// Route to generate a new Razorpay Payment Link
router.post('/create', async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
    }

    const { amount, description, customerName, customerEmail, customerPhone } = req.body;

    const paymentLinkRequest = {
      amount: amount * 100, // amount in paisa
      currency: "INR",
      accept_partial: false,
      description: description || "Payment for Harsha Arts",
      customer: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        policy_name: "Harsha Arts Store"
      }
    };

    const paymentLink = await razorpayInstance.paymentLink.create(paymentLinkRequest);
    
    res.json({ success: true, paymentLink });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
