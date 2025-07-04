import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Pages
import Home from "./Pages/Home";
import Legal from "./Pages/Legal";
import NotFound from "./Pages/NotFound";
import Appointment from "./Pages/Appointment";
import ContactMap from "./Pages/ContactMap";
import Booking from "./Pages/Booking";
import Service1Page from "./Pages/Service1Page";

// Global Components
import ScrollUpButton from "./Components/ScrollUpButton";
import ScrollToTop from "./Components/ScrollToTop"; // ✅ NEW: Import scroll-to-top fix
import Booking2 from "./Pages/Booking2";
import Booking3 from "./Pages/Booking3";

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop /> {/* ✅ Ensure scroll resets on route change */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/contact" element={<ContactMap />} />
          <Route path="/roof-cleaning" element={<Service1Page />} />
          <Route path="/booking1" element={<Booking />} />
          <Route path="/booking2" element={<Booking2 />} />
          <Route path="/booking3" element={<Booking3 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ScrollUpButton />
      </Router>
    </div>
  );
}

export default App;
