const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
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

    assignedTo: {
      type: String,
      required: [true, 'Assignee name is required'],
      trim: true,
    },

    base: {
      type: String,
      required: [true, 'Base is required'],
      enum: ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Assignment quantity must be at least 1'],
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    purpose: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['active', 'returned', 'expended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);