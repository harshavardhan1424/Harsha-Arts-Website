const crypto = require('crypto');

/**
 * Safely verifies a Razorpay payment signature (Critical Security Layer)
 * This prevents fake payment confirmations and tampering.
 * 
 * @param {string} orderId - The razorpay_order_id
 * @param {string} paymentId - The razorpay_payment_id
 * @param {string} signature - The razorpay_signature from the frontend
 * @param {string} secretKey - The YOUR_SECRET_KEY from environment variables
 * @returns {boolean} - Returns true if the signature is authentic and valid
 */
function verifyRazorpaySignature(orderId, paymentId, signature, secretKey) {
  if (!orderId || !paymentId || !signature || !secretKey) {
    return false;
  }

  // Step 6: Verify Payment Signature logic
  const sign = orderId + "|" + paymentId;
  const expectedSign = crypto
    .createHmac("sha256", secretKey)
    .update(sign.toString())
    .digest("hex");

  return expectedSign === signature;
}

module.exports = {
  verifyRazorpaySignature
};
