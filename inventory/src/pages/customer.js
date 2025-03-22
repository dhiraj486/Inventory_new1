import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import companyLogo from './assests/arniya.jpeg';
import Logout from '../components/logout';

const Customer = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://your-api-endpoint.com/customers'); // Replace with your API endpoint
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        setError('Error fetching customer data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login");
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Order.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Total.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        </nav>
      </aside>

      <div style={styles.main}>
        <div style={styles.header}>
          <input
            type="text"
            placeholder="Search by"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Order</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((item, index) => (
              <tr key={index} style={styles.tr}>
                <td style={styles.td}>{item.Name}</td>
                <td style={styles.td}>{item.Email}</td>
                <td style={styles.td}>{item.Phone}</td>
                <td style={styles.td}>{item.Order}</td>
                <td style={styles.td}>{item.price}</td>
                <td style={styles.td}>{item.Total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Logout
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close modal
        onConfirm={handleLogout} // Confirm logout
      />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    height: "100vh",
  },
  sidebar: {
    width: "250px",
    height: "100%",
    backgroundColor: "#1e1e2f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px 15px",
  },
  logoImg: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },
  logo: {
    marginBottom: "30px",
    fontSize: "24px",
    color: "#6c63ff",
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
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  navItemLogout: {
    marginTop: "auto",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    textAlign: "left",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  main: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    padding: "20px",
    overflowY: "auto",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  searchInput: {
    padding: '8px',
    width: '200px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  th: {
    borderBottom: '2px solid grey',
    textAlign: 'left',
    padding: '12px 15px',
    backgroundColor: '#fff',
    color: '#000',
  },
  tr: {
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '12px 15px',
  },
};

export default Customer;
