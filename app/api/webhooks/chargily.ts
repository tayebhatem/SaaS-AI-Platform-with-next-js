import express from "express"
import crypto from "crypto"
import { createTransaction } from "@/lib/actions/transaction.action";

const app = express();
const port = 3000;

// Your Chargily Pay Secret key, will be used to calculate the Signature
const apiSecretKey = process.env.NEXT_PUBLIC_CHARGILY_KEY;

app.use(express.json());

app.post('/', (req, res) => {
    // Extracting the 'signature' header from the HTTP request
    const signature = req.get('signature');

    // Getting the raw payload from the request body
    const payload = JSON.stringify(req.body);

    // If there is no signature, ignore the request
    if (!signature || !apiSecretKey) {
        return res.sendStatus(400);
    }

    // Calculate the signature
    const computedSignature = crypto.createHmac('sha256', apiSecretKey)
        .update(payload)
        .digest('hex');

    // If the calculated signature doesn't match the received signature, ignore the request
    if (computedSignature !== signature) {
        return res.sendStatus(403);
    }

    // If the signatures match, proceed to decode the JSON payload
    const event = req.body;

    if(event.type==='checkout.paid'){
        const checkout = event.data;
        const { id, amount, metadata} = checkout;
        const transaction = {
        chargilyId: id,
        amount: amount ? amount / 100 : 0,
        plan: metadata[0]?.plan || "",
        credits: Number(metadata[0]?.credits) || 0,
        buyerId: metadata[0]?.buyerId || "",
        createdAt: new Date(),
        };
       createTransaction(transaction)
    }

    // Respond with a 200 OK status code to let us know that you've received the webhook
    res.sendStatus(200);
});

