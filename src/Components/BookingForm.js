import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "../Styles/BookingForm.css";
import visa from "../Assets/visa.png";
import mastercard from "../Assets/mastercard.webp";
import amex from "../Assets/amex.png";
import discover from "../Assets/discover.jpg";
import { supabase } from "../supabaseClient";

function BookingForm() {
  const frequencyOptions = ["Weekly", "Every Other Week", "Monthly", "One-Time"];
  const tipsOptions = ["0%", "10%", "15%", "20%", "Other"];
  const parkingOptions = ["$0", "$5", "$10", "$20", "Other"];
  const extrasList = ["Extra Heavy Duty", "Blinds", "Interior Windows", "Oven", "Garage"];

  const instructionQuestions = [
    "How Clean Is Your Home?",
    "How Will We Get Inside?",
    "Where Can We Park?",
  ];

  const instructionOptions = {
    "How Clean Is Your Home?": [
      "Very Dirty",
      "Needs Extra Attention",
      "Mostly Clean",
      "Regularly Cleaned and Maintained",
      "Almost Spotless",
    ],
    "How Will We Get Inside?": [
      "I will be Home",
      "I will Leave the Key (Leave the Instructions on the Notes)",
      "I will provide an Access Code (Leave the Code on the Notes)",
      "Other (Leave the Instruction on the Notes)",
    ],
    "Where Can We Park?": [
      "Park in my Driveway (Leave the stall number if applicable on the notes)",
      "Paid Parking Available Nearby",
      "There is Street Parking",
      "Parking in the Park Garage (Leave the instructions on the Notes)",
    ],
  };

  const [formState, setFormState] = useState({
    location: "Snohomish County",
    service: "Maintenance Cleaning",
    frequency: null,
    bedrooms: 1,
    bathrooms: 1,
    halfBath: 1,
    den: 1,
    extras: [],
    instructions: {},
    date: "",
    tip: null,
    parkingFee: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    coupon: "",
    amount: 0,
  });

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const toggleExtra = (item) => {
    setFormState((prev) => ({
      ...prev,
      extras: prev.extras.includes(item)
        ? prev.extras.filter((e) => e !== item)
        : [...prev.extras, item],
    }));
  };

  const handleInstructionChange = (question, value) => {
    setFormState((prev) => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        [question]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const formData = {
      ...formState,
      half_bath: formState.halfBath,
      parking_fee: formState.parkingFee,
      first_name: formState.firstName,
      last_name: formState.lastName,
      payment_status: "pending",
    };

    const { data, error } = await supabase.from("bookings1").insert([formData]).select();

    if (error) {
      console.error("Error saving booking:", error);
      alert("Booking failed: " + error.message);
      return;
    }

    const bookingId = data[0].id;

    try {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

      const response = await fetch("http://localhost:5000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 999,
          bookingId,
          email: formState.email,
        }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        alert("Failed to redirect to payment.");
      }
    } catch (err) {
      console.error("Stripe redirect error:", err);
      alert("Payment error occurred.");
    }
  };

  return (
    <div className="booking-form">
      <div className="form-layout">
        <div className="form-wrapper">
          <div className="booking-container">
            <h2>Where Will The Service Be Taking Place?</h2>
            <div className="form-row">
              <label>Location</label>
              <select className="custom-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option>Snohomish County</option>
                <option>King County</option>
              </select>
            </div>

            <div className="form-row">
              <label>Services</label>
              <select className="custom-select" value={service} onChange={(e) => setService(e.target.value)}>
                <option>Maintenance Cleaning</option>
                <option>Deep Clean</option>
                <option>Post Construction</option>
                <option>Move in/out Cleaning</option>
              </select>
            </div>

            <div className="form-row">
              <label>Frequency</label>
              <div className="button-group">
                {frequencyOptions.map((freq, i) => (
                  <button
                    key={i}
                    className={frequency === freq ? "active" : ""}
                    onClick={() => setFrequency(freq)}
                    type="button"
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <h2>What Needs To Be Done?</h2>
            <div className="form-grid">
              <div>
                <label>Bedrooms</label>
                <select value={bedrooms} onChange={(e) => setBedrooms(+e.target.value)} className="custom-select">
                  {[...Array(7)].map((_, i) => <option key={i} value={i + 1}>{i + 1} Bedrooms</option>)}
                </select>
              </div>
              <div>
                <label>Bathrooms</label>
                <select value={bathrooms} onChange={(e) => setBathrooms(+e.target.value)} className="custom-select">
                  {[...Array(5)].map((_, i) => <option key={i} value={i + 1}>{i + 1} Bathrooms</option>)}
                </select>
              </div>
              <div>
                <label>Half Bath</label>
                <select value={halfBath} onChange={(e) => setHalfBath(+e.target.value)} className="custom-select">
                  {[...Array(5)].map((_, i) => <option key={i} value={i + 1}>{i + 1} Half Baths</option>)}
                </select>
              </div>
              <div>
                <label>Den</label>
                <select value={den} onChange={(e) => setDen(+e.target.value)} className="custom-select">
                  {[...Array(6)].map((_, i) => <option key={i} value={i + 1}>{i + 1} Dens</option>)}
                </select>
              </div>
            </div>

            <h2>Select Extras</h2>
            <div className="extras-grid">
              {extrasList.map((extra, i) => (
                <div key={i} className={`extra-box ${extras.includes(extra) ? "active" : ""}`} onClick={() => toggleExtra(extra)}>
                  <div className="icon">📦</div>
                  <p>{extra}</p>
                </div>
              ))}
            </div>

            <h2>Instructions for Providers</h2>
            {instructionQuestions.map((question, i) => (
              <div key={i} className="form-row">
                <label>{question}</label>
                <select
                  className="custom-select"
                  value={instructions[question] || ""}
                  onChange={(e) => handleInstructionChange(question, e.target.value)}
                >
                  <option value="">Select Option</option>
                  {instructionOptions[question].map((option, j) => (
                    <option key={j} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}

            <h2>Select Date</h2>
            <div className="form-row">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <h2>Tips & Parking (Optional)</h2>
            <div className="form-row">
              <label>Tips</label>
              <div className="button-group">
                {tipsOptions.map((tipOption, i) => (
                  <button
                    key={i}
                    className={tip === tipOption ? "active" : ""}
                    onClick={() => setTip(tipOption)}
                    type="button"
                  >
                    {tipOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label>Parking</label>
              <div className="button-group">
                {parkingOptions.map((price, i) => (
                  <button
                    key={i}
                    className={parkingFee === price ? "active" : ""}
                    onClick={() => setParkingFee(price)}
                    type="button"
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

            <h2>Customer Details</h2>
            <div className="form-grid">
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <h2>Special Notes Or Instructions</h2>
            <textarea placeholder="Special Notes or Instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <h2>Coupon Code</h2>
            <div className="form-row">
              <input type="text" placeholder="Enter Coupon Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <button className="apply-btn" type="button">Apply</button>
            </div>

            <h2>Payment Information</h2>
            <div className="card-box">
              <label>Add new card</label>
              <div className="card-input-group">
                <input type="text" placeholder="Card Number" className="card-number" />
                <input type="text" placeholder="MM / YY" className="card-exp" />
                <input type="text" placeholder="CVC" className="card-cvc" />
              </div>
              <div className="card-icons">
                <img src={mastercard} alt="mastercard" />
                <img src={visa} alt="visa" />
                <img src={discover} alt="discover" />
                <img src={amex} alt="amex" />
              </div>
            </div>

            <button className="submit-btn" onClick={handleSubmit}>Confirm & Pay</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;


