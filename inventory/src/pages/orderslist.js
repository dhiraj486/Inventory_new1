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

  const [orderData, setOrderData] = useState({
    id: '',
    customerName: '',
    address: '',
    contactNumber: '',
    product: '',
    quantity: '',
    status: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  useEffect(() => {
    fetchOrders();
  }, []);
  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      status: ''
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
    const { customerName, address, contactNumber, product, quantity } = orderData;

    if (!customerName || !address || !contactNumber || !product || !quantity) {
      alert('Please fill all required fields!');
      return;
    }
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/orders/${currentEditId}`, orderData);
      } else {
        await axios.post('http://localhost:5000/orders', orderData);
      }
      fetchOrders();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving order:', error);
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
      await axios.put(`http://localhost:5000/orders/${id}`, updatedOrder);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };
  const filteredOrders = orders.filter((order) =>
    String(order.customerName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(order.product).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(order.id).toString().includes(searchTerm)
  );
  
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div style={styles.container}>
      <Sidebar setIsModalOpen={setIsLogoutOpen} />
      <div style={styles.main}>
        <div style={styles.header}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.addButton} onClick={openAddModal}>
            Add Order +
          </button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>Contact No</th>
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
                  <td style={styles.td}>{order.customerName}</td>
                  <td style={styles.td}>{order.address}</td>
                  <td style={styles.td}>{order.contactNumber}</td>
                  <td style={styles.td}>{order.product}</td>
                  <td style={styles.td}>{order.quantity}</td>
                  <td style={styles.td}>{order.status || '-'}</td>
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
            {['customerName', 'address', 'contactNumber', 'product', 'quantity', 'status'].map((field) => (
              <input
                key={field}
                type={field === 'quantity' ? 'number' : 'text'}
                name={field}
                placeholder={`${field.replace(/([A-Z])/g, ' $1').trim()} *`}
                value={orderData[field]}
                onChange={handleInputChange}
                style={styles.modalInput}
              />
            ))}
            <div style={styles.modalButtons}>
              <button style={styles.saveButton} onClick={handleSaveOrder}>
                {isEditMode ? 'Update Order' : 'Save Order'}
              </button>
              <button style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <Logout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogout} />
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
};
export default Orders;