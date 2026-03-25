const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },

    assetName: {
      type: String,
      required: true,
    },

    assetType: {
      type: String,
      required: true,
    },

    fromBase: {
      type: String,
      required: [true, 'Source base is required'],
      enum: ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'],
    },

    toBase: {
      type: String,
      required: [true, 'Destination base is required'],
      enum: ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Transfer quantity must be at least 1'],
    },

    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transfer', TransferSchema);