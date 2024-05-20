

import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
 
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_CHARGILY_KEY}`,
      'Content-Type': 'application/json'
    },
    body: `{"metadata":[{"plan":"${transaction.plan}","credits":"${transaction.credits}","buyerId":"${transaction.buyerId}"}],"amount":${transaction.amount},"currency":"dzd","payment_method":"edahabia","failure_url":"${process.env.NEXT_PUBLIC_URL}","webhook_endpoint":"${process.env.NEXT_PUBLIC_URL}/api/webhooks/chargily","locale":"en","success_url":"${process.env.NEXT_PUBLIC_URL}/profile"}`
  };
  
await fetch('https://pay.chargily.net/test/api/v2/checkouts', options)
    .then(response => response.json())
    .then(
        response => {    
              
          if(response.checkout_url){
          
            window.location.href = response.checkout_url;
           
        }
        }
        )
    .catch(err => console.error(err));
  
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with a buyerId
    const newTransaction = await Transaction.create({
      ...transaction, buyer: transaction.buyerId
    })

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error)
  }
}