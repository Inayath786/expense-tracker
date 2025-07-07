import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    salary: "",
    threshold: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser({
          name: res.data.Name || "",
          salary: res.data.salary || "",
          threshold: res.data.threshold || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err.message);
        setError("Failed to load profile data.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/update/${userId}`,
        {
          name: user.name,
          salary: user.salary,
          threshold: user.threshold,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Profile updated successfully!");
window.location.href = "/main";
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p className="profile-message">Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <form className="profile-form" onSubmit={handleUpdate}>
        <div className="profile-field">
          <label className="profile-label">Name</label>
          <input
            type="text"
            className="profile-input"
            value={user.name}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="profile-field">
          <label className="profile-label">Salary</label>
          <input
            type="number"
            className="profile-input"
            value={user.salary}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, salary: e.target.value }))
            }
          />
        </div>
        <div className="profile-field">
          <label className="profile-label">Threshold</label>
          <input
            type="number"
            className="profile-input"
            value={user.threshold}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, threshold: e.target.value }))
            }
          />
        </div>
        <button className="profile-button" type="submit">
          Update Profile
        </button>
      </form>

      {error && <p className="profile-message">{error}</p>}
    </div>
  );
}

export default Profile;
