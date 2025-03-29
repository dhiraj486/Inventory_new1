import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from '../components/sidebar';
import Logout from '../components/logout';

const Settings = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInEmail = localStorage.getItem("userEmail");
    const loggedInName = localStorage.getItem("userName");

    if (loggedInEmail) setEmail(loggedInEmail);
    if (loggedInName) setName(loggedInName);
  }, []);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const location = useLocation(); // 👈 This gives you the current URL path
  const currentPath = location.pathname;

  console.log("Current location path: ", currentPath);

  const handleNameChange = (e) => {
    setName(e.target.value);
    localStorage.setItem("userName", e.target.value); // update name on change
  };

  return (
    <div style={styles.container}>
      <Sidebar setIsModalOpen={setIsModalOpen} />
      <main style={styles.content}>
        <h2 style={styles.heading}>Setting</h2>
        <div style={styles.profilePicSection}>
          <div style={styles.profilePicWrapper}>
            {profilePic ? (
              <img src={profilePic} alt="Profile" style={styles.profilePic} />
            ) : (
              <div style={styles.placeholderPic}>+</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              style={styles.fileInput}
            />
          </div>
          <button
            style={styles.uploadBtn}
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Profile Pic
          </button>
        </div>
        <div style={styles.formSection}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="John"
            style={styles.input}
          />
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            readOnly
            style={{ ...styles.input, backgroundColor: "#eee" }}
          />
        </div>
      </main>
      <Logout
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close modal
        onConfirm={handleLogout} // Confirm logout
      />
    </div>
  );
};

// Inline styles
const styles = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  content: { flexGrow: 1, padding: "40px", backgroundColor: "#f7f7f7" },
  heading: { marginBottom: "20px", fontSize: "28px" },
  profilePicSection: { display: "flex", alignItems: "center", marginBottom: "40px" },
  profilePicWrapper: { position: "relative", width: "100px", height: "100px", marginRight: "20px" },
  profilePic: { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #ccc" },
  placeholderPic: { width: "100%", height: "100%", backgroundColor: "#e0e0e0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", color: "#888", cursor: "pointer" },
  fileInput: { display: "none" },
  uploadBtn: { backgroundColor: "#000", color: "#fff", padding: "10px 20px", cursor: "pointer", border: "none", fontSize: "14px" },
  formSection: { display: "flex", flexDirection: "column" },
  label: { marginBottom: "8px", fontWeight: "bold" },
  input: { width: "300px", padding: "10px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" },
  activeNavItem: {
    backgroundColor: "white",
    color:"black",
    fontWeight: "bold",
    transform: "scale(1.05)",
    borderRadius:"0 30px 30px 0",
  },
};

export default Settings;
