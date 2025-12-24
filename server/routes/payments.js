import express from 'express';
import axios from 'axios';
import config from '../config.js';

const router = express.Router();

/**
 * Approve a payment (Server-Side Approval)
 * Called when frontend receives onReadyForServerApproval callback
 */
router.post('/approve', async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ 
      error: 'Missing paymentId',
      message: 'paymentId is required in request body'
    });
  }

  if (!config.PI_API_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'PI_API_KEY is not configured'
    });
  }

  try {
    // Call Pi Platform API to approve the payment
    const response = await axios.post(
      `${config.PI_API_BASE_URL}/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          'Authorization': `Key ${config.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json({
      success: true,
      payment: response.data,
    });

  } catch (error) {
    
    res.status(error.response?.status || 500).json({
      error: 'Payment approval failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
    });
  }
});

/**
 * Complete a payment (Server-Side Completion)
 * Called when frontend receives onReadyForServerCompletion callback
 */
router.post('/complete', async (req, res) => {
  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'paymentId and txid are required in request body'
    });
  }

  if (!config.PI_API_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'PI_API_KEY is not configured'
    });
  }

  try {
    // Call Pi Platform API to complete the payment
    const response = await axios.post(
      `${config.PI_API_BASE_URL}/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          'Authorization': `Key ${config.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Verify the transaction was successful
    const payment = response.data;
    
    if (!payment.transaction?.verified) {
      return res.status(400).json({
        error: 'Transaction verification failed',
        message: 'Blockchain transaction could not be verified',
        payment,
      });
    }
    
    res.json({
      success: true,
      payment: payment,
      verified: payment.transaction.verified,
    });

  } catch (error) {
    
    res.status(error.response?.status || 500).json({
      error: 'Payment completion failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
    });
  }
});

/**
 * Get payment details
 * Retrieve information about a specific payment
 */
router.get('/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  if (!config.PI_API_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'PI_API_KEY is not configured'
    });
  }

  try {
    const response = await axios.get(
      `${config.PI_API_BASE_URL}/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Key ${config.PI_API_KEY}`,
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    
    res.status(error.response?.status || 500).json({
      error: 'Failed to retrieve payment',
      message: error.response?.data?.message || error.message,
    });
  }
});

export default router;
