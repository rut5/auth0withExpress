import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/profile", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <div
          style={{
            width: 80,
            height: 80,
            backgroundColor: "#e0e0e0",
            borderRadius: "50%",
            marginBottom: "16px",
          }}
        />
        <div
          style={{
            height: "24px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            marginBottom: "12px",
            width: "200px",
          }}
        />
        <div
          style={{
            height: "16px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            width: "250px",
          }}
        />
      </div>
    );
  }

  if (!user) return <p>Not logged in.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hello {user.given_name || user.name}</h2>
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name}
          style={{ width: 80, borderRadius: "50%", marginBottom: "12px" }}
        />
      )}
      {user.email && (
        <p style={{ marginTop: "8px", fontSize: "16px", color: "#555" }}>
          {user.email}
        </p>
      )}
      <a
        href="http://localhost:3000/logout"
        style={{
          display: "inline-block",
          marginTop: "16px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Log out
      </a>
    </div>
  );
};

export default Profile;
