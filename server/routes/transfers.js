const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { fromBase: req.user.base },
          { toBase: req.user.base },
        ],
      };
    }

    if (req.query.status) query.status = req.query.status;

    const transfers = await Transfer.find(query)
      .populate('transferredBy', 'name role')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { assetId, toBase, quantity, notes } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    if (asset.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${asset.quantity}`,
      });
    }

    if (asset.base === toBase) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same base',
      });
    }

    if (req.user.role !== 'admin' && asset.base !== req.user.base) {
      return res.status(403).json({
        success: false,
        message: 'You can only transfer assets from your own base',
      });
    }

    const transfer = await Transfer.create({
      asset: assetId,
      assetName: asset.name,
      assetType: asset.assetType,
      fromBase: asset.base,
      toBase,
      quantity,
      transferredBy: req.user.id,
      notes,
    });

    await transfer.populate('transferredBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Transfer request created — awaiting approval',
      data: transfer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put(
  '/:id/approve',
  authorize('admin', 'base_commander'),
  async (req, res) => {
    try {
      const transfer = await Transfer.findById(req.params.id);

      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found',
        });
      }

      if (transfer.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Transfer is already ${transfer.status}`,
        });
      }

      const sourceAsset = await Asset.findById(transfer.asset);
      if (!sourceAsset || sourceAsset.quantity < transfer.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient quantity at source base',
        });
      }

      sourceAsset.quantity -= transfer.quantity;
      await sourceAsset.save();

      let destAsset = await Asset.findOne({
        name: transfer.assetName,
        base: transfer.toBase,
        assetType: transfer.assetType,
      });

      if (destAsset) {
        destAsset.quantity += transfer.quantity;
        await destAsset.save();
      } else {
        await Asset.create({
          name: transfer.assetName,
          assetType: transfer.assetType,
          quantity: transfer.quantity,
          base: transfer.toBase,
          purchasedBy: req.user.id,
          description: `Transferred from ${transfer.fromBase}`,
        });
      }

      transfer.status = 'approved';
      transfer.approvedBy = req.user.id;
      transfer.approvedAt = new Date();
      await transfer.save();

      res.status(200).json({
        success: true,
        message: `Transfer approved — ${transfer.quantity} ${transfer.assetName} moved to ${transfer.toBase}`,
        data: transfer,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put(
  '/:id/reject',
  authorize('admin', 'base_commander'),
  async (req, res) => {
    try {
      const transfer = await Transfer.findById(req.params.id);

      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found',
        });
      }

      if (transfer.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Transfer is already ${transfer.status}`,
        });
      }

      transfer.status = 'rejected';
      transfer.approvedBy = req.user.id;
      transfer.approvedAt = new Date();
      await transfer.save();

      res.status(200).json({
        success: true,
        message: 'Transfer rejected',
        data: transfer,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;