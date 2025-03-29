import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from '../components/sidebar';
import Logout from '../components/logout';

const Customer = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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
    navigate("/");
  };

  const location = useLocation();
  const currentPath = location.pathname;

  console.log("Current location path: ", currentPath);

  const filteredCustomers = customers.filter((customer) =>
    String(customer.Name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.Email).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.Phone).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.Order).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.price).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.Total).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedCustomers = filteredCustomers.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div style={styles.container}>
      <Sidebar setIsModalOpen={setIsModalOpen} />
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
            {displayedCustomers.map((item, index) => (
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
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            Next
          </button>
        </div>
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
  activeNavItem: {
    backgroundColor: "white",
    color: "black", 
    fontWeight: "bold",
    transform: "scale(1.05)",
    borderRadius:"0 30px 30px 0",
  },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' },
  pageButton: {
    padding: '8px 16px', margin: '0 10px', backgroundColor: '#111', color: '#fff',
    border: 'none', borderRadius: '5px', cursor: 'pointer', disabled: { backgroundColor: '#ccc' }
  },
  pageInfo: { fontSize: '14px' },
};

export default Customer;
