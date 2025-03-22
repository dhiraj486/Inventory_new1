import React, { useState, useEffect }from 'react';
import { useNavigate } from 'react-router-dom';
import companyLogo from './assests/arniya.jpeg';
import axios from 'axios';
import Logout from '../components/logout';

const Product = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      console.log('Fetched products:', res.data);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Function to fetch order updates (optional)
  const fetchOrderUpdates = async () => {
    // Dummy function for now (replace with actual logic)
    console.log('Fetching order updates...');
  };
  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => {
      fetchOrderUpdates();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(null);

  const [productData, setProductData] = useState({
    id: '',
    name: '',
    sku: '',
    location: '',
    price: '',
    stock: '',
  });

  const openAddModal = () => {
    setProductData({ id: '', name: '', sku: '', location: '', price: '', stock: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (index) => {
    const productToEdit = products[index];
    setProductData(productToEdit);
    setIsEditMode(true);
    setCurrentEditIndex(index);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };
  
  const handleSaveProduct = async () => {
    console.log('Save button clicked!');
    console.log('Product data:', productData);
  
    try {
      if (isEditMode) {
        console.log('Updating product...');
        await axios.put(`http://localhost:5000/products/${productData.id}`, productData);
      } else {
        console.log('Adding new product...');
        await axios.post('http://localhost:5000/products', productData);
      }
  
      fetchProducts();
      setShowModal(false);
      setProductData({ id: '', name: '', sku: '', location: '', price: '', stock: '' });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      const updatedProducts = products.filter((product) => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      console.log('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };  

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button style={styles.addButton} onClick={openAddModal}>
            Add Item +
          </button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>No ID</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{item.id}</td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.sku}</td>
                  <td style={styles.td}>{item.location}</td>
                  <td style={styles.td}>{item.price}</td>
                  <td style={styles.td}>{item.stock}</td>
                  <td style={styles.td}>
                    <button style={styles.editButton} onClick={() => openEditModal(index)}>
                      ✏️
                    </button>
                    <button style={styles.deleteButton} onClick={() => handleDeleteProduct(item.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.noData}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '10px' }}>{isEditMode ? 'Edit Product' : 'Add Product'}</h2>

            <input
              style={styles.modalInput}
              type="text"
              name="id"
              placeholder="No ID"
              value={productData.id}
              onChange={handleInputChange}
            />
            <input
              style={styles.modalInput}
              type="text"
              name="name"
              placeholder="Product Name"
              value={productData.name}
              onChange={handleInputChange}
            />
            <input
              style={styles.modalInput}
              type="text"
              name="sku"
              placeholder="SKU"
              value={productData.sku}
              onChange={handleInputChange}
            />
            <input
              style={styles.modalInput}
              type="text"
              name="location"
              placeholder="Location"
              value={productData.location}
              onChange={handleInputChange}
            />
            <input
              style={styles.modalInput}
              type="text"
              name="price"
              placeholder="Price"
              value={productData.price}
              onChange={handleInputChange}
            />
            <input
              style={styles.modalInput}
              type="text"
              name="stock"
              placeholder="Stock"
              value={productData.stock}
              onChange={handleInputChange}
            />

            <div style={{ marginTop: '15px' }}>
              <button style={styles.saveButton} onClick={handleSaveProduct}>
                {isEditMode ? 'Update' : 'Save'}
              </button>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
    deleteButton: {
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
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#fff',
      padding: '10px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    noData: {
      textAlign: 'center',
      padding: '20px',
      color: '#6c757d',
      fontStyle: 'italic',
    },    
  };
  
export default Product;