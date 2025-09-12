import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onCancel, currencySymbol = 'R' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Beverages',
    price: '',
    quantity: '',
    minStockLevel: '5'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'Beverages',
        price: product.price || '',
        quantity: product.quantity || '',
        minStockLevel: product.minStockLevel || '5'
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'Minimum stock level cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      minStockLevel: parseInt(formData.minStockLevel)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const formStyles = {
    form: {
      backgroundColor: '#ffffff',
      padding: '1.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#2d3748',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    inputFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    inputError: {
      borderColor: '#e53e3e',
      boxShadow: '0 0 0 3px rgba(229, 62, 62, 0.1)',
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      backgroundColor: '#fff',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    selectFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    textarea: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      color: '#1a202c',
      resize: 'vertical',
      minHeight: '80px',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    textareaFocus: {
      borderColor: '#3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    errorText: {
      fontSize: '0.75rem',
      color: '#e53e3e',
      marginTop: '0.25rem',
    },
    formButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1.5rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      border: 'none',
      outline: 'none',
    },
    buttonPrimary: {
      backgroundColor: '#3182ce',
      color: '#ffffff',
    },
    buttonPrimaryHover: {
      backgroundColor: '#2b6cb0',
      transform: 'translateY(-2px)',
    },
    buttonSecondary: {
      backgroundColor: '#e2e8f0',
      color: '#2d3748',
    },
    buttonSecondaryHover: {
      backgroundColor: '#cbd5e0',
      transform: 'translateY(-2px)',
    },
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={formStyles.form}
    >
      <h3 style={formStyles.title}>
        {product ? 'Edit Product' : 'Add New Product'}
      </h3>
      
      <div style={formStyles.formGrid}>
        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
            style={{
              ...formStyles.input,
              ...(errors.name ? formStyles.inputError : {}),
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = formStyles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = formStyles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.name ? formStyles.inputError.borderColor : formStyles.input.border;
              e.currentTarget.style.boxShadow = errors.name ? formStyles.inputError.boxShadow : 'none';
            }}
          />
          {errors.name && <span style={formStyles.errorText}>{errors.name}</span>}
        </div>

        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={formStyles.select}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = formStyles.selectFocus.borderColor;
              e.currentTarget.style.boxShadow = formStyles.selectFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = formStyles.select.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="Beverages">Beverages</option>
            <option value="Food">Food</option>
            <option value="Snacks">Snacks</option>
            <option value="Desserts">Desserts</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>Price ({currencySymbol}) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            style={{
              ...formStyles.input,
              ...(errors.price ? formStyles.inputError : {}),
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = formStyles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = formStyles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.price ? formStyles.inputError.borderColor : formStyles.input.border;
              e.currentTarget.style.boxShadow = errors.price ? formStyles.inputError.boxShadow : 'none';
            }}
          />
          {errors.price && <span style={formStyles.errorText}>{errors.price}</span>}
        </div>

        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
            placeholder="0"
            style={{
              ...formStyles.input,
              ...(errors.quantity ? formStyles.inputError : {}),
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = formStyles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = formStyles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.quantity ? formStyles.inputError.borderColor : formStyles.input.border;
              e.currentTarget.style.boxShadow = errors.quantity ? formStyles.inputError.boxShadow : 'none';
            }}
          />
          {errors.quantity && <span style={formStyles.errorText}>{errors.quantity}</span>}
        </div>

        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>Low Stock Alert Level *</label>
          <input
            type="number"
            name="minStockLevel"
            value={formData.minStockLevel}
            onChange={handleChange}
            min="0"
            required
            placeholder="5"
            style={{
              ...formStyles.input,
              ...(errors.minStockLevel ? formStyles.inputError : {}),
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = formStyles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = formStyles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.minStockLevel ? formStyles.inputError.borderColor : formStyles.input.border;
              e.currentTarget.style.boxShadow = errors.minStockLevel ? formStyles.inputError.boxShadow : 'none';
            }}
          />
          {errors.minStockLevel && <span style={formStyles.errorText}>{errors.minStockLevel}</span>}
        </div>

        <div style={{ ...formStyles.formGroup, ...formStyles.fullWidth }}>
          <label style={formStyles.label}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description (optional)"
            rows="3"
            style={formStyles.textarea}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = formStyles.textareaFocus.borderColor;
              e.currentTarget.style.boxShadow = formStyles.textareaFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = formStyles.textarea.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <div style={formStyles.formButtons}>
        <button
          type="submit"
          style={{ ...formStyles.button, ...formStyles.buttonPrimary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = formStyles.buttonPrimaryHover.backgroundColor;
            e.currentTarget.style.transform = formStyles.buttonPrimaryHover.transform;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = formStyles.buttonPrimary.backgroundColor;
            e.currentTarget.style.transform = 'none';
          }}
        >
          {product ? 'Update' : 'Add'} Product
        </button>
        {product && (
          <button
            type="button"
            onClick={onCancel}
            style={{ ...formStyles.button, ...formStyles.buttonSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = formStyles.buttonSecondaryHover.backgroundColor;
              e.currentTarget.style.transform = formStyles.buttonSecondaryHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = formStyles.buttonSecondary.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;