import { AppDataSource } from '../database/data-source';
import { Payment, PaymentType, PaymentStatus, PaymentMethod, EntityType, RelatedEntityType } from '../entities/Payment';

export interface CreatePaymentDTO {
  // Who is paying
  entityType: EntityType; // 'member', 'team_member', 'guest'
  entityId: number;

  // What they're paying for
  paymentType: PaymentType; // 'team_subscription', 'field_booking', etc.
  relatedEntityType: RelatedEntityType; // 'team', 'field_booking', etc.
  relatedEntityId: string; // Can be UUID or integer as string

  // Payment details
  amount: number;
  currency?: string;
  description?: string;

  // Optional gateway info (for online payments)
  gatewayName?: string;
  paymentMethod?: PaymentMethod;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentDTO {
  transactionId: string;
  gatewayResponse?: string;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export class PaymentService {
  private paymentRepository = AppDataSource.getRepository(Payment);

  /**
   * Generate unique payment reference
   * Format: PAY_YYYYMMDD_HHMMSS_RANDOM
   */
  private generatePaymentReference(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY_${dateStr}_${timeStr}_${random}`;
  }

  /**
   * Create a new payment record
   */
  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    const paymentReference = this.generatePaymentReference();

    const payment = this.paymentRepository.create({
      payment_reference: paymentReference,
      payment_type: data.paymentType,
      entity_type: data.entityType,
      entity_id: data.entityId,
      related_entity_type: data.relatedEntityType,
      related_entity_id: data.relatedEntityId,
      amount: data.amount,
      currency: data.currency || 'EGP',
      gateway_name: data.gatewayName,
      payment_method: data.paymentMethod,
      description: data.description,
      metadata: data.metadata,
      status: 'pending',
    });

    return await this.paymentRepository.save(payment);
  }

  /**
   * Confirm a payment (called by payment gateway webhook or manual confirmation)
   */
  async confirmPayment(paymentReference: string, data: ConfirmPaymentDTO): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_reference: paymentReference },
    });

    if (!payment) {
      throw new Error(`Payment not found with reference: ${paymentReference}`);
    }

    if (payment.status === 'completed') {
      throw new Error('Payment already completed');
    }

    payment.transaction_id = data.transactionId;
    payment.gateway_response = data.gatewayResponse;
    payment.payment_method = data.paymentMethod || payment.payment_method;
    payment.status = 'completed';
    payment.completed_at = new Date();

    if (data.metadata) {
      payment.metadata = { ...payment.metadata, ...data.metadata };
    }

    return await this.paymentRepository.save(payment);
  }

  /**
   * Mark payment as failed
   */
  async failPayment(paymentReference: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_reference: paymentReference },
    });

    if (!payment) {
      throw new Error(`Payment not found with reference: ${paymentReference}`);
    }

    payment.status = 'failed';
    payment.notes = reason || 'Payment failed';

    return await this.paymentRepository.save(payment);
  }

  /**
   * Process a refund
   */
  async refundPayment(
    paymentReference: string,
    staffId: number,
    reason?: string
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_reference: paymentReference },
    });

    if (!payment) {
      throw new Error(`Payment not found with reference: ${paymentReference}`);
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    payment.status = 'refunded';
    payment.refunded_at = new Date();
    payment.refunded_by_staff_id = staffId;
    payment.notes = reason || 'Payment refunded';

    return await this.paymentRepository.save(payment);
  }

  /**
   * Process manual/cash payment (staff processed)
   */
  async processManualPayment(
    paymentReference: string,
    staffId: number,
    paymentMethod: PaymentMethod = 'cash'
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_reference: paymentReference },
    });

    if (!payment) {
      throw new Error(`Payment not found with reference: ${paymentReference}`);
    }

    payment.status = 'completed';
    payment.completed_at = new Date();
    payment.processed_by_staff_id = staffId;
    payment.payment_method = paymentMethod;
    payment.gateway_name = 'manual';

    return await this.paymentRepository.save(payment);
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(paymentReference: string): Promise<Payment | null> {
    return await this.paymentRepository.findOne({
      where: { payment_reference: paymentReference },
      relations: ['processed_by_staff', 'refunded_by_staff'],
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: number): Promise<Payment | null> {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ['processed_by_staff', 'refunded_by_staff'],
    });
  }

  /**
   * Get payments for an entity (member/team_member)
   */
  async getPaymentsByEntity(
    entityType: EntityType,
    entityId: number,
    status?: PaymentStatus
  ): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.entity_type = :entityType', { entityType })
      .andWhere('payment.entity_id = :entityId', { entityId })
      .orderBy('payment.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get payments for a related entity (e.g., all payments for a specific team)
   */
  async getPaymentsByRelatedEntity(
    relatedEntityType: RelatedEntityType,
    relatedEntityId: string,
    status?: PaymentStatus
  ): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.related_entity_type = :relatedEntityType', { relatedEntityType })
      .andWhere('payment.related_entity_id = :relatedEntityId', { relatedEntityId })
      .orderBy('payment.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get payments by type
   */
  async getPaymentsByType(
    paymentType: PaymentType,
    status?: PaymentStatus,
    limit: number = 100
  ): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.payment_type = :paymentType', { paymentType })
      .orderBy('payment.created_at', 'DESC')
      .limit(limit);

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get payment statistics for a date range
   */
  async getPaymentStatistics(
    startDate: Date,
    endDate: Date,
    paymentType?: PaymentType
  ): Promise<{
    totalAmount: number;
    count: number;
    byStatus: Record<PaymentStatus, { count: number; amount: number }>;
    byMethod: Record<string, { count: number; amount: number }>;
  }> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.created_at >= :startDate', { startDate })
      .andWhere('payment.created_at <= :endDate', { endDate });

    if (paymentType) {
      queryBuilder.andWhere('payment.payment_type = :paymentType', { paymentType });
    }

    const payments = await queryBuilder.getMany();

    const stats = {
      totalAmount: 0,
      count: payments.length,
      byStatus: {} as Record<PaymentStatus, { count: number; amount: number }>,
      byMethod: {} as Record<string, { count: number; amount: number }>,
    };

    payments.forEach((payment) => {
      stats.totalAmount += Number(payment.amount);

      // By status
      if (!stats.byStatus[payment.status]) {
        stats.byStatus[payment.status] = { count: 0, amount: 0 };
      }
      stats.byStatus[payment.status].count++;
      stats.byStatus[payment.status].amount += Number(payment.amount);

      // By method
      const method = payment.payment_method || 'unknown';
      if (!stats.byMethod[method]) {
        stats.byMethod[method] = { count: 0, amount: 0 };
      }
      stats.byMethod[method].count++;
      stats.byMethod[method].amount += Number(payment.amount);
    });

    return stats;
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentReference: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_reference: paymentReference },
    });

    if (!payment) {
      throw new Error(`Payment not found with reference: ${paymentReference}`);
    }

    if (payment.status !== 'pending' && payment.status !== 'processing') {
      throw new Error(`Cannot cancel payment with status: ${payment.status}`);
    }

    payment.status = 'cancelled';
    payment.notes = reason || 'Payment cancelled';

    return await this.paymentRepository.save(payment);
  }
}
