import React from 'react';

const Logout = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <button onClick={onConfirm} style={styles.confirmButton}>Yes</button>
        <button onClick={onClose} style={styles.cancelButton}>No</button>
      </div>
    </div>
  );
};

// Styles for the modal
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    margin: '10px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    margin: '10px',
    cursor: 'pointer',
  },
};

export default Logout;