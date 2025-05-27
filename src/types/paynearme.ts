export interface PayNearMeOrder {
  id: string;
  status: OrderStatus;
  amount: {
    value: number;
    currency: string;
  };
  transactionType: 'debit' | 'credit' | 'ach' | 'cash';
  metadata?: Record<string, any>;
  customerDetails?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

export type OrderStatus = 
  | 'Created'
  | 'NotifyPaymentStateRequestSentToMerchant'
  | 'DepositedByProvider'
  | 'AbortedOnProvider'
  | 'Cancelled'
  | 'Refunded'
  | 'ChargedBackByProvider';

export interface FindOrderParams {
  orderId?: string;
  customerIdentifier?: string;
  orderTrackingUrl?: string;
}
