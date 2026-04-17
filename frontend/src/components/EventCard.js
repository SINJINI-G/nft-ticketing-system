import { useNavigate } from "react-router-dom";

export default function EventCard({ event, role }) {
  const navigate = useNavigate();

  return (
    <div style={{
      width: "220px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      overflow: "hidden",
      margin: "12px",
      display: "inline-block",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      background: "white"
    }}>
      
      {/* IMAGE */}
      <img
        src={event.image}
        alt="event"
        style={{
          width: "100%",
          height: "140px",
          objectFit: "cover"
        }}
      />

      {/* CONTENT */}
      <div style={{ padding: "10px" }}>
        <h4 style={{ margin: "5px 0" }}>{event.name}</h4>

        <p style={{ margin: "5px 0", color: "#555" }}>
          📅 {event.date}
        </p>

        <p style={{ margin: "5px 0", fontWeight: "bold" }}>
          💰 {event.price} ETH
        </p>

        {/* BUTTON */}
        {role === "user" ? (
          <button
            onClick={() => navigate(`/ticket/${event.id}`)}
            style={{
              marginTop: "8px",
              padding: "6px 10px",
              background: "black",
              color: "white",
              border: "none",
              width: "100%",
              cursor: "pointer"
            }}
          >
            Buy Ticket
          </button>
        ) : (
          <button
            onClick={() => navigate(`/event/${event.id}`)}
            style={{
              marginTop: "8px",
              padding: "6px 10px",
              background: "#444",
              color: "white",
              border: "none",
              width: "100%",
              cursor: "pointer"
            }}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}