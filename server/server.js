// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const app = express();

// Supabase client using service role key (for secure update)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe webhooks require raw body
app.use("/webhook", express.raw({ type: "application/json" }));

// JSON body parser for other routes
app.use(cors());
app.use(express.json());

/**
 * Create Stripe Checkout Session
 */
app.post("/create-checkout-session", async (req, res) => {
  const { bookingId, email, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Ivory Standard Booking",
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        bookingId: bookingId.toString(),
      },
      success_url: `http://localhost:3000/contact?booking_id=${bookingId}`,
      cancel_url: `http://localhost:3000/booking1`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Stripe Webhook to Update Supabase Booking
 */
app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const { error } = await supabase
        .from("bookings1")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

      if (error) {
        console.error("❌ Supabase update failed:", error.message);
      } else {
        console.log("✅ Supabase payment_status updated for booking ID:", bookingId);
      }
    }
  }

  res.json({ received: true });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
