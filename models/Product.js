const mongoose = require('mongoose');

const compatibilitySchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  oemNumber: { type: String, required: true },
  compatibility: [compatibilitySchema],
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
});

// Exclude seller from the output
productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.seller; // Remove seller from the response
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;