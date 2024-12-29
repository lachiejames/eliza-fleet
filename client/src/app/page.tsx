import { CheckoutButton } from "@/components/checkout-button";
import Stripe from "stripe";

async function getPlans() {
  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not configured");
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
    type: 'recurring'
  });

  return prices.data;
}

export default async function Home() {
  const plans = await getPlans();
  const sortedPlans = plans.sort((a, b) => (a.unit_amount || 0) - (b.unit_amount || 0));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      <main className="relative container mx-auto px-4 py-24">
        {/* Header */}
        <h1 className="text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Eliza Fleet Plans
        </h1>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sortedPlans.map((plan, index) => {
            const product = plan.product as Stripe.Product;
            const isPopular = product.metadata.popular === 'true';
            const features = product.metadata.features ? JSON.parse(product.metadata.features) : [];
            const priceAmount = plan.unit_amount ? plan.unit_amount / 100 : 0;

            return (
              <div key={plan.id} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 ${isPopular ? 'opacity-75' : ''}`} />
                <div className="relative bg-black border border-white/10 rounded-lg p-8 h-full flex flex-col hover:border-purple-500/50 transition-colors">
                  {isPopular && (
                    <div className="absolute -top-5 right-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm">
                      Popular
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${priceAmount}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <span className="mr-3 text-purple-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton
                    priceId={plan.id}
                    className={`w-full ${
                      isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity'
                        : index === 0
                        ? 'bg-white text-black hover:bg-purple-100 transition-colors'
                        : 'border border-purple-500 text-white hover:bg-purple-950/50 transition-colors'
                    }`}
                  >
                    {index === 0 ? 'Get Started' : index === sortedPlans.length - 1 ? 'Contact Sales' : 'Subscribe'}
                  </CheckoutButton>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
