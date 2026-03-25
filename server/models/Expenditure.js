const mongoose = require('mongoose');

const ExpenditureSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Expenditure must be at least 1'],
    },

    base: {
      type: String,
      required: [true, 'Base is required'],
      enum: ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'],
    },

    expendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: ['combat', 'training', 'maintenance', 'lost', 'damaged', 'other'],
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

module.exports = mongoose.model('Expenditure', ExpenditureSchema);