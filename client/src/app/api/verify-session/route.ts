import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: Request) {
    const { STRIPE_SECRET_KEY } = process.env;

    if (!STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: "Stripe secret key not configured" },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json(
            { error: "Session ID is required" },
            { status: 400 }
        );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            customer_email: session.customer_details?.email || null,
        });
    } catch (err) {
        console.error("Error retrieving session:", err);
        return NextResponse.json(
            { error: "Error retrieving session" },
            { status: 500 }
        );
    }
}
