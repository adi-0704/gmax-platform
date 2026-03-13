const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  images: [{
    type: String, // URLs to images
  }],
  specifications: {
    type: Map,
    of: String, // e.g., { "voltage": "220V", "power": "100W" }
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
