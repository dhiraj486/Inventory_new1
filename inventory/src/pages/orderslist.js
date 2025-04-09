import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logout from '../components/logout';
import Sidebar from '../components/sidebar';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(false);  // For loading state
  const [error, setError] = useState('');  // For error handling

  const [orderData, setOrderData] = useState({
    id: '',
    customerName: '',
    address: '',
    contactNumber: '',
    product: '',
    quantity: '',
    status: 'Pending',
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders.');
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setOrderData({
      id: '',
      customerName: '',
      address: '',
      contactNumber: '',
      product: '',
      quantity: '',
      status: 'Pending',
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setOrderData(order);
    setIsEditMode(true);
    setIsModalOpen(true);
    setCurrentEditId(order.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const handleSaveOrder = async () => {
    const orderToSave = {
      ...orderData,
      // Add customerId and userEmail (assume they come from session or context)
      customerId: orderData.customerId || 1, // For now, default to 1 or get it from a context
      userEmail: orderData.userEmail || 'user@example.com', // Default or fetch from session
      totalAmount: parseFloat(orderData.totalAmount) || 0,  // Ensure it's a number, and fallback if not provided
    };
  
    if (isEditMode) {
      try {
        await axios.put(`http://localhost:5000/api/orders/${orderData.id}`, orderToSave);
        fetchOrders();
        setIsModalOpen(false);
        setOrderData({ id: '', customerName: '', address: '', contactNumber: '', product: '', quantity: '', status: 'Pending', totalAmount: '' });
      } catch (error) {
        console.error('Error updating order:', error.response ? error.response.data : error.message);
      }
    } else {
      try {
        await axios.post('http://localhost:5000/api/orders', orderToSave);
        fetchOrders();
        setIsModalOpen(false);
        setOrderData({ id: '', customerName: '', address: '', contactNumber: '', product: '', quantity: '', status: 'Pending', totalAmount: '' });
      } catch (error) {
        console.error('Error saving order:', error.response ? error.response.data : error.message);
      }
    }
  };  

  const handleCancelOrder = async (id) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;
    try {
      const orderToCancel = orders.find((order) => order.id === id);
      if (!orderToCancel) {
        alert('Order not found');
        return;
      }
      const updatedOrder = { ...orderToCancel, status: 'Cancelled' };
      await axios.put(`http://localhost:5000/api/orders/${id}`, updatedOrder);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleSyncOrders = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/orders/sync');
      await fetchOrders();
    } catch (error) {
      console.error('Error syncing orders:', error);
      setError('Failed to sync orders from API.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id?.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div style={styles.container}>
      <Sidebar setIsModalOpen={setIsLogoutOpen} />
      <div style={styles.main}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.syncButton} onClick={handleSyncOrders}>
              Sync Orders
            </button>
          </div>
          <button style={styles.addButton} onClick={openAddModal}>
            Add Order +
          </button>
        </div>

        {/* Loading and Error handling */}
        {loading ? (
          <div style={styles.loadingSpinner}>Loading...</div>
        ) : error ? (
          <div style={styles.errorMessage}>{error}</div>
        ) : null}

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer Name</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.length > 0 ? (
              displayedOrders.map((order) => (
                <tr key={order.id} style={styles.tr}>
                  <td style={styles.td}>{order.id}</td>
                  <td style={styles.td}>{order.customer_name}</td>
                  <td style={styles.td}>{order.address}</td>
                  <td style={styles.td}>{order.contact_number}</td>
                  <td style={styles.td}>{order.product}</td>
                  <td style={styles.td}>{order.quantity}</td>
                  <td style={styles.td}>{order.status}</td>
                  <td style={styles.td}>
                    <button style={styles.editButton} onClick={() => openEditModal(order)}>✏️</button>
                    <button style={styles.cancelButton} onClick={() => handleCancelOrder(order.id)}>🚫</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={styles.noData}>No orders found.</td>
              </tr>
            )}
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

      {isModalOpen && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h2>{isEditMode ? 'Edit Order' : 'Add New Order'}</h2>
      
      {/* Render input fields for all required fields */}
      {['customerName', 'address', 'contactNumber', 'product', 'quantity', 'status', 'totalAmount'].map((field) => (
        <input
          key={field}
          type={field === 'quantity' || field === 'totalAmount' ? 'number' : 'text'}
          name={field}
          placeholder={`${field.replace(/([A-Z])/g, ' $1').trim()} *`}
          value={orderData[field] || ''}
          onChange={handleInputChange}
          style={styles.modalInput}
        />
      ))}
      
      {/* Hidden input field for customerId and userEmail */}
      <input
        type="hidden"
        name="customerId"
        value={orderData.customerId} // Make sure this is set in your state or context
      />
      <input
        type="hidden"
        name="userEmail"
        value={orderData.userEmail} // Make sure this is set in your state or context
      />

      <div style={styles.modalButtons}>
        <button style={styles.saveButton} onClick={handleSaveOrder}>
          {isEditMode ? 'Update Order' : 'Save Order'}
        </button>
        <button style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

      <Logout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={() => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
      }} />
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
    msOverflowStyle: "none", // for IE and Edge
    scrollbarWidth: "none", 
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  searchInput: {
    padding: '10px 16px',
    width: '250px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  th: {
    textAlign: 'left',
    borderBottom: '2px solid grey',
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
  editButton: {
    padding: '5px 10px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: 'red',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalInput: {
    marginBottom: '10px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  saveButton: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
    fontStyle: 'italic',
  },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' },
  pageButton: {
    padding: '8px 16px', margin: '0 10px', backgroundColor: '#111', color: '#fff',
    border: 'none', borderRadius: '5px', cursor: 'pointer', disabled: { backgroundColor: '#ccc' }
  },
  pageInfo: { fontSize: '14px' },
  loadingErrorOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    fontSize: '24px',
    color: '#fff',
  },
  errorMessage: {
    fontSize: '18px',
    color: 'red',
  },
  syncButton: {
    padding: '10px 16px',
    marginLeft: '10px',
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
export default Orders;