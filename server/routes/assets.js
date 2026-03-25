const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role !== 'admin') {
      query.base = req.user.base;
    }

    if (req.query.base) query.base = req.query.base;
    if (req.query.assetType) query.assetType = req.query.assetType;

    const assets = await Asset.find(query)
      .populate('purchasedBy', 'name email')
      .sort({ createdAt: -1 });              

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('purchasedBy', 'name email');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, assetType, quantity, base, unitCost, description } = req.body;

    if (req.user.role !== 'admin' && base !== req.user.base) {
      return res.status(403).json({
        success: false,
        message: 'You can only add assets to your own base',
      });
    }

    const asset = await Asset.create({
      name,
      assetType,
      quantity,
      base,
      unitCost,
      description,
      purchasedBy: req.user.id,
    });

    await asset.populate('purchasedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `${name} added to ${base} inventory`,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authorize('admin', 'base_commander'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } 
    );

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Asset removed from inventory',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard/summary', async (req, res) => {
  try {
    const Transfer = require('../models/Transfer');
    const Assignment = require('../models/Assignment');
    const Expenditure = require('../models/Expenditure');

    let baseFilter = {};
    if (req.user.role !== 'admin') {
      baseFilter = { base: req.user.base };
    }
    if (req.query.base) baseFilter.base = req.query.base;

    let dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      };
    }

    const purchased = await Asset.aggregate([
      { $match: { ...baseFilter, isActive: true, ...dateFilter } },
      {
        $group: {
          _id: { base: '$base', assetType: '$assetType' },
          total: { $sum: '$quantity' },
        },
      },
    ]);

    const transfersIn = await Transfer.aggregate([
      {
        $match: {
          status: 'approved',
          toBase: baseFilter.base || { $exists: true },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { base: '$toBase', assetType: '$assetType' },
          total: { $sum: '$quantity' },
        },
      },
    ]);

    const transfersOut = await Transfer.aggregate([
      {
        $match: {
          status: 'approved',
          fromBase: baseFilter.base || { $exists: true },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { base: '$fromBase', assetType: '$assetType' },
          total: { $sum: '$quantity' },
        },
      },
    ]);

    const assignments = await Assignment.aggregate([
      { $match: { ...baseFilter, ...dateFilter } },
      {
        $group: {
          _id: { base: '$base', assetType: '$assetType' },
          total: { $sum: '$quantity' },
        },
      },
    ]);

    const expenditures = await Expenditure.aggregate([
      { $match: { ...baseFilter, ...dateFilter } },
      {
        $group: {
          _id: { base: '$base', assetType: '$assetType' },
          total: { $sum: '$quantity' },
        },
      },
    ]);

    const currentInventory = await Asset.aggregate([
      { $match: { ...baseFilter, isActive: true } },
      {
        $group: {
          _id: { base: '$base', assetType: '$assetType' },
          total: { $sum: '$quantity' },
          assets: {
            $push: { name: '$name', quantity: '$quantity' },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        purchased,
        transfersIn,
        transfersOut,
        assignments,
        expenditures,
        currentInventory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;