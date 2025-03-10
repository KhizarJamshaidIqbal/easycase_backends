const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    
    // Use a default seller ID if not authenticated
    const sellerId = req.user?.id || '64f8a9b25d42a8a8d0f7e3c7'; // Replace with a default seller ID
    
    console.log("Creating product with seller ID:", sellerId);
    
    // Validate required fields
    const validationErrors = {};
    
    if (!req.body.title || req.body.title.trim().length < 5) {
      validationErrors.title = "Title is required and must be at least 5 characters";
    }
    
    if (!req.body.description || req.body.description.trim().length < 20) {
      validationErrors.description = "Description is required and must be at least 20 characters";
    }
    
    if (!req.body.price || isNaN(req.body.price) || req.body.price <= 0) {
      validationErrors.price = "Price is required and must be greater than zero";
    }
    
    if (!req.body.category) {
      validationErrors.category = "Category is required";
    }
    
    if (!req.body.oemNumber) {
      validationErrors.oem = "OEM number is required";
    }
    
    if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length < 3) {
      validationErrors.images = "At least 3 images are required";
    }
    
    if (!req.body.compatibility || !Array.isArray(req.body.compatibility) || req.body.compatibility.length === 0) {
      validationErrors.compatibility = "At least one vehicle compatibility entry is required";
    } else {
      // Validate each compatibility item
      const invalidItems = req.body.compatibility.some(
        item => !item.make || !item.model || !item.year
      );
      
      if (invalidItems) {
        validationErrors.compatibility = "All vehicle compatibility fields are required";
      }
    }
    
    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // If validation passes, create the product
    const productData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category || req.body.categoryId,
      oemNumber: req.body.oemNumber || req.body.oem,
      compatibility: req.body.compatibility,
      seller: sellerId,
      images: req.body.images,
      status: 'pending'
    };

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: "Validation failed",
        errors
      });
    }
    
    // Handle other errors
    console.error("Product creation error:", error);
    res.status(500).json({ message: "Server error creating product", error: error.message });
  }
};
// Get all products for Seller 
exports.getProducts = async (req, res) => {
  try {
      const products = await Product.find()
          .populate('category seller')
          .select('title description price images'); // Select specific fields including images

      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Get all products for admin (includes status information)
exports.adminGetAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category seller')
      .select('title description price images status oemNumber compatibility'); // Include status field

    res.status(200).json(products);
  } catch (error) {
    console.error("Admin product retrieval error:", error);
    res.status(500).json({ message: "Server error retrieving products", error: error.message });
  }
};

// Update product status by admin
exports.updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    // Validate status value
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status value", 
        error: "Status must be 'pending', 'approved', or 'rejected'" 
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update only the status field
    product.status = status;
    await product.save();
    
    res.status(200).json({ 
      message: "Product status updated successfully", 
      product: {
        id: product._id,
        title: product.title,
        status: product.status
      }
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Server error updating product status", error: error.message });
  }
};
// Search products
exports.searchProducts = async (req, res) => {
  const { query } = req.query; // Get search query from query parameters
  try {
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('category seller');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 