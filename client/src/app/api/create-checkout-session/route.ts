import { NextResponse } from "next/server";
import Stripe from "stripe";

// TODO: Simplify this
function getURL() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_URL) {
        return process.env.NEXT_PUBLIC_URL;
    }
    return "http://localhost:3000"; // Fallback for local dev
}

export async function POST(request: Request) {
    const { STRIPE_SECRET_KEY } = process.env;

    if (!STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: "Stripe secret key not configured" },
            { status: 500 }
        );
    }

    // Initialize Stripe with the correct API version
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    try {
        const { priceId } = await request.json();
        const baseUrl = getURL();

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/`,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err) {
        console.error("Error creating checkout session:", err);
        return NextResponse.json(
            { error: "Error creating checkout session" },
            { status: 500 }
        );
    }
}
