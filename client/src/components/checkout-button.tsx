'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutButtonProps {
  priceId: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckoutButton({ priceId, children, className }: CheckoutButtonProps) {
  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe checkout error:', error);
      }
    } catch (err) {
      console.error('Error initiating checkout:', err);
    }
  };

  return (
    <Button onClick={handleCheckout} className={cn(className)}>
      {children}
    </Button>
  );
}