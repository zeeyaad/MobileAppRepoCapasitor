import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Payment } from '../entities/Payment';
import { PaymobBillingData, PaymobService } from '../services/PaymobService';
import { PaymentService } from '../services/PaymentService';

export class PaymobController {
  private paymobService = new PaymobService();
  private paymentService = new PaymentService();
  private paymentRepo = AppDataSource.getRepository(Payment);

  async start(req: Request, res: Response): Promise<void> {
    try {
      const { paymentReference, billingData } = req.body as {
        paymentReference?: string;
        billingData?: Partial<PaymobBillingData>;
      };

      if (!paymentReference) {
        res.status(400).json({ success: false, error: 'paymentReference is required' });
        return;
      }

      const payment = await this.paymentRepo.findOne({ where: { payment_reference: paymentReference } });
      if (!payment) {
        res.status(404).json({ success: false, error: 'Payment not found' });
        return;
      }

      if (payment.status === 'completed') {
        res.status(400).json({ success: false, error: 'Payment already completed' });
        return;
      }

      const amountCents = Math.round(Number(payment.amount) * 100);
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        res.status(400).json({ success: false, error: 'Invalid payment amount' });
        return;
      }

      const filledBillingData: PaymobBillingData = {
        first_name: billingData?.first_name || 'Test',
        last_name: billingData?.last_name || 'User',
        email: billingData?.email || 'test@example.com',
        phone_number: billingData?.phone_number || '+201000000000',
        apartment: billingData?.apartment || 'NA',
        floor: billingData?.floor || 'NA',
        street: billingData?.street || 'NA',
        building: billingData?.building || 'NA',
        shipping_method: billingData?.shipping_method || 'NA',
        postal_code: billingData?.postal_code || '00000',
        city: billingData?.city || 'Cairo',
        country: billingData?.country || 'EG',
        state: billingData?.state || 'C',
      };

      const authToken = await this.paymobService.authenticate();
      const orderId = await this.paymobService.createOrder({
        authToken,
        amountCents,
        merchantOrderId: payment.payment_reference,
        currency: payment.currency,
      });

      const paymentKey = await this.paymobService.createPaymentKey({
        authToken,
        amountCents,
        orderId,
        billingData: filledBillingData,
        currency: payment.currency,
      });

      const iframeUrl = this.paymobService.buildIframeUrl(paymentKey);

      res.status(200).json({
        success: true,
        data: {
          paymentReference: payment.payment_reference,
          orderId,
          iframeUrl,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start Paymob payment',
      });
    }
  }

  async webhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as any;

      const paymentReference: string | undefined =
        payload?.obj?.order?.merchant_order_id || payload?.obj?.merchant_order_id || payload?.merchant_order_id;

      if (!paymentReference) {
        res.status(400).json({ success: false, error: 'Missing merchant_order_id (payment reference)' });
        return;
      }

      const success: boolean =
        Boolean(payload?.obj?.success) ||
        payload?.obj?.is_success === true ||
        payload?.obj?.data?.success === true ||
        payload?.success === true;

      const transactionId =
        payload?.obj?.id?.toString() || payload?.obj?.transaction_id?.toString() || payload?.transaction_id?.toString() || 'unknown';

      if (!success) {
        await this.paymentService.failPayment(paymentReference, 'Paymob reported failed payment');
        res.status(200).json({ success: true, status: 'ignored_failed' });
        return;
      }

      const payment = await this.paymentService.confirmPayment(paymentReference, {
        transactionId,
        gatewayResponse: JSON.stringify(payload),
        metadata: {
          paymob_order_id: payload?.obj?.order?.id,
        },
      });

      res.status(200).json({ success: true, payment });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle Paymob webhook',
      });
    }
  }

  async redirect(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({ success: true, query: req.query });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle Paymob redirect',
      });
    }
  }
}
