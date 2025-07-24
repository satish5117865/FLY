import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    // _id: { String },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date }
  },

  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
