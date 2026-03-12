// Paystack integration utilities
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
  metadata?: {
    application_id?: string;
    reference_number?: string;
    payment_method?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  channels?: string[];
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl: string;
}

export const usePaystack = () => {
  const initializePayment = (options: PaystackOptions) => {
    if (typeof window === 'undefined' || !window.PaystackPop) {
      throw new Error('Paystack library not loaded');
    }

    const handler = window.PaystackPop.setup(options);
    handler.openIframe();
  };

  return { initializePayment };
};