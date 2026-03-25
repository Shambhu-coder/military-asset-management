const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },

    assetType: {
      type: String,
      required: [true, 'Asset type is required'],
      enum: ['vehicle', 'weapon', 'ammunition', 'equipment'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },

    base: {
      type: String,
      required: [true, 'Base is required'],
      enum: ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'],
    },

    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    unitCost: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', AssetSchema);