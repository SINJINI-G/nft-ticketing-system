import { useNavigate } from "react-router-dom";

export default function Navbar({ role, setRole }) {
  const navigate = useNavigate();

  function switchRole(newRole) {
    setRole(newRole);
    navigate("/"); // 🔥 force reload of correct page
  }

  return (
    <div style={{ padding: 10, borderBottom: "1px solid" }}>
      <button onClick={() => switchRole("user")}>User</button>
      <button onClick={() => switchRole("organiser")}>Organiser</button>

      <span style={{ marginLeft: 20 }}>
        Current Role: <b>{role}</b>
      </span>
    </div>
  );
}