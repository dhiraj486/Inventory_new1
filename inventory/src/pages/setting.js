import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import companyLogo from './assests/arniya.jpeg';
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
    navigate("/Login");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    localStorage.setItem("userName", e.target.value); // update name on change
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <img src={companyLogo} alt="Logo" style={styles.logoImg} />
        <h2 style={styles.logo}>ARNIYA</h2>
        <nav style={styles.nav}>
          <button style={styles.navItem} onClick={() => navigate("/Dashboard")}>🏠 Dashboard</button>
          <button style={styles.navItem} onClick={() => navigate("/product")}>📦 Product</button>
          <button style={styles.navItem} onClick={() => navigate("/customer")}>👥 Customer</button>
          <button style={styles.navItem} onClick={() => navigate("/analytics")}>📊 Analytics</button>
          <button style={styles.navItem} onClick={() => navigate("/setting")}>⚙️ Setting</button>
          <button
            style={styles.navItemLogout}
            onClick={() => setIsModalOpen(true)} // Open modal on click
            >
            🚪 Log Out
            </button>
          {/* <button
  style={styles.navItemLogout}
  onClick={() => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  }}
>
  Log Out
</button> */}
        </nav>
      </aside>
      

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
  sidebar: { width: "250px", backgroundColor: "#1e1e2f", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 15px", },
  logo: { marginBottom: "40px", fontSize: "20px", color: "#6c63ff", textAlign: "center" },
  logoImg: { height: "50px", width: "50px", borderRadius: "50%", margin: "0 auto 15px", },
  nav: { display: "flex", flexDirection: "column", gap: "15px",},
  navItem: { backgroundColor: "transparent", color: "#fff", border: "none", textAlign: "left",padding: "10px 20px",borderRadius: "10px", cursor: "pointer",fontSize: "16px", transition: "all 0.3s ease", },
  navItemLogout: { marginTop: "auto", backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "10px 20px", textAlign: "left", borderRadius: "10px", cursor: "pointer", fontSize: "16px", transition: "all 0.3s ease", },
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
};

export default Settings;
