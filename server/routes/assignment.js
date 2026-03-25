const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Expenditure = require('../models/Expenditure');
const Asset = require('../models/Asset');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') query.base = req.user.base;
    if (req.query.base) query.base = req.query.base;
    if (req.query.status) query.status = req.query.status;

    const assignments = await Assignment.find(query)
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authorize('admin', 'base_commander'), async (req, res) => {
  try {
    const { assetId, assignedTo, quantity, purpose } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${asset.quantity}`,
      });
    }

    if (req.user.role !== 'admin' && asset.base !== req.user.base) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign assets from your own base',
      });
    }

    asset.quantity -= quantity;
    await asset.save();

    const assignment = await Assignment.create({
      asset: assetId,
      assetName: asset.name,
      assetType: asset.assetType,
      assignedTo,
      base: asset.base,
      quantity,
      assignedBy: req.user.id,
      purpose,
    });

    await assignment.populate('assignedBy', 'name role');

    res.status(201).json({
      success: true,
      message: `${quantity} ${asset.name} assigned to ${assignedTo}`,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/expenditures', async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') query.base = req.user.base;
    if (req.query.base) query.base = req.query.base;

    const expenditures = await Expenditure.find(query)
      .populate('expendedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenditures.length,
      data: expenditures,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/expenditures', async (req, res) => {
  try {
    const { assetId, quantity, reason, notes } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${asset.quantity}`,
      });
    }

    asset.quantity -= quantity;
    await asset.save();

    const expenditure = await Expenditure.create({
      asset: assetId,
      assetName: asset.name,
      assetType: asset.assetType,
      quantity,
      base: asset.base,
      expendedBy: req.user.id,
      reason,
      notes,
    });

    await expenditure.populate('expendedBy', 'name role');

    res.status(201).json({
      success: true,
      message: `${quantity} ${asset.name} logged as expended`,
      data: expenditure,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;