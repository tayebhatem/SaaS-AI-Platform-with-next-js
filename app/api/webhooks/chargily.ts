import express, { Request, Response } from "express";
import crypto from "crypto";
import { createTransaction } from "@/lib/actions/transaction.action";

const app = express();
const port = 3000;

// Your Chargily Pay Secret key, will be used to calculate the Signature
const apiSecretKey = process.env.NEXT_PUBLIC_CHARGILY_KEY;

if (!apiSecretKey) {
  throw new Error("NEXT_PUBLIC_CHARGILY_KEY environment variable is not set.");
}

app.use(express.json());

app.post('/api/webhooks/chargily', (req: Request, res: Response) => {
    // Extracting the 'signature' header from the HTTP request
    const signature = req.get('signature');

    // Getting the raw payload from the request body
    const payload = JSON.stringify(req.body);

    // If there is no signature or apiSecretKey, ignore the request
    if (!signature) {
        console.error('No signature provided');
        return res.sendStatus(400);
    }

    // Calculate the signature
    const computedSignature = crypto.createHmac('sha256', apiSecretKey)
        .update(payload)
        .digest('hex');

    // Compare the calculated signature with the received signature in a time-constant manner
    const isSignatureValid = crypto.timingSafeEqual(Buffer.from(computedSignature, 'hex'), Buffer.from(signature, 'hex'));

    // If the calculated signature doesn't match the received signature, ignore the request
    if (!isSignatureValid) {
        console.error('Invalid signature');
        return res.sendStatus(403);
    }

    // If the signatures match, proceed to decode the JSON payload
    const event = req.body;

    // Switch based on the event type
    switch (event.type) {
        case 'checkout.paid':
            const checkout = event.data;
            console.log('Payment successful:', checkout);
            const{id,amount,metadata}=checkout
            const transaction = {
                chargilyId: id,
                amount: amount ? amount / 100 : 0,
                plan: metadata[0]?.plan || "",
                credits: Number(metadata[0]?.credits) || 0,
                buyerId: metadata[0]?.buyerId || "",
                createdAt: new Date(),
                };
            createTransaction(transaction)
            break;
        case 'checkout.failed':
            const failedCheckout = event.data;
            console.log('Payment failed:', failedCheckout);
            // Handle the failed payment
            break;
        default:
            console.warn('Unhandled event type:', event.type);
            break;
    }

    // Respond with a 200 OK status code to let us know that you've received the webhook
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
