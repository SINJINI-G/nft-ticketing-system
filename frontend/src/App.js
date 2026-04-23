import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import UserDashboard from "./pages/UserDashboard";
import TicketPage from "./pages/TicketPage";
import OrganiserDashboard from "./pages/OrganiserDashboard";
import EventDetails from "./pages/EventDetails";
import Navbar from "./components/Navbar";
import MyTickets from "./pages/MyTickets";

function App() {
  const [role, setRole] = useState("user");

  return (
    <Router>
      <Navbar role={role} setRole={setRole} />

      <Routes>
        {role === "user" && (
          <>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/ticket/:id" element={<TicketPage />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/buy/:id" element={<TicketPage />} />  
          </>
        )}

        {role === "organiser" && (
          <>
            <Route path="/" element={<OrganiserDashboard />} />
            <Route path="/event/:id" element={<EventDetails />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;