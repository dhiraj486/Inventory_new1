// Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ setIsModalOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside style={styles.sidebar}>
      {/* <img src="/assests/arinya.png" alt="Logo" style={styles.logoImg} /> */}
      {/* <h2 style={styles.logo}>ARINYA</h2> */}
      <nav style={styles.nav}>
        <button
          style={{
            ...styles.navItem,
            ...(currentPath === "/Dashboard" ? styles.activeNavItem : {}),
          }}
          onClick={() => navigate("/Dashboard")}
        >
          🏠 Dashboard
        </button>
        <button
          style={{
            ...styles.navItem,
            ...(currentPath === "/product" ? styles.activeNavItem : {}),
          }}
          onClick={() => navigate("/product")}
        >
          📦 Product
        </button>
        <button
          style={{
            ...styles.navItem,
            ...(currentPath === "/orderslist" ? styles.activeNavItem : {}),
          }}
          onClick={() => navigate("/orderslist")}
        >
          📋 Order List
        </button>
        <button
          style={{
            ...styles.navItem,
            ...(currentPath === "/customer" ? styles.activeNavItem : {}),
          }}
          onClick={() => navigate("/customer")}
        >
          👥 Customer
        </button>
        <button
          style={{
            ...styles.navItem,
            ...(currentPath === "/analytics" ? styles.activeNavItem : {}),
          }}
          onClick={() => navigate("/analytics")}
        >
          📊 Analytics
        </button>
        <button
          style={{
            ...styles.navItem,
            ...(currentPath === "/setting" ? styles.activeNavItem : {}),
          }}
          onClick={() => navigate("/setting")}
        >
          ⚙️ Setting
        </button>
        <button
          style={styles.navItemLogout}
          onClick={() => setIsModalOpen(true)} // Open modal on click
        >
          🚪 Log Out
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;

const styles = {
  sidebar: {
    width: "250px",
    backgroundColor: "#1e1e2f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px 15px",
  },
  logo: {
    marginBottom: "30px",
    fontSize: "24px",
    color: "#FFD700",
    textAlign: "center",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  navItem: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "none",
    textAlign: "left",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease",
  },
  navItemLogout: {
    marginTop: "auto",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    textAlign: "left",
    borderRadius: "0 30px 30px 0",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease",
  },
  logoImg: {
    height: "80px",
    width: "200px",
    margin: "0 auto 15px",
  },
  activeNavItem: {
    backgroundColor: "white",
    color: "black",
    fontWeight: "bold",
    transform: "scale(1.05)",
    borderRadius: "0 30px 30px 0",
  },
};
