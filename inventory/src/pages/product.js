import React, { useState, useEffect }from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Logout from '../components/logout';
import Sidebar from '../components/sidebar';

const Product = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      console.log('Fetched products:', res.data);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrderUpdates = async () => {
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
    navigate("/");
  };

  const location = useLocation(); 
  const currentPath = location.pathname;

  console.log("Current location path: ", currentPath);

  const filteredProducts = products.filter((product) =>
    String(product.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(product.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(product.sku).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + rowsPerPage);

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
            {displayedProducts.length > 0 ? (
              displayedProducts.map((item, index) => (
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
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
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
    // searchInput: {
    //   padding: '8px',
    //   width: '200px',
    //   borderRadius: '5px',
    //   border: '1px solid #ccc',
    // },
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
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' },
    pageButton: {
      padding: '8px 16px', margin: '0 10px', backgroundColor: '#111', color: '#fff',
      border: 'none', borderRadius: '5px', cursor: 'pointer', disabled: { backgroundColor: '#ccc' }
    },
    pageInfo: { fontSize: '14px' },
  };
  
export default Product;