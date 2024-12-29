import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
    const { STRIPE_SECRET_KEY } = process.env;

    if (!STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: "Stripe secret key not configured" },
            { status: 500 }
        );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    try {
        const prices = await stripe.prices.list({
            active: true,
            expand: ["data.product"],
            type: "recurring",
        });

        return NextResponse.json(prices.data);
    } catch (err) {
        console.error("Error fetching prices:", err);
        return NextResponse.json(
            { error: "Error fetching prices" },
            { status: 500 }
        );
    }
}
