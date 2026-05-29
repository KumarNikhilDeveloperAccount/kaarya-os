'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        setIsLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  const openCheckout = async (options: Partial<RazorpayOptions>) => {
    const res = await loadScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return { openCheckout, isLoaded };
};
