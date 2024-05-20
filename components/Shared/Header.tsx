'use client'

import { createTransaction } from "@/lib/actions/transaction.action";

import { useEffect } from "react";

const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => {
    useEffect(()=>{
        const query = new URLSearchParams(window.location.search);
        const id=query.get("checkout_id")
        if(id){
            const options = {
                method: 'GET',
                headers: {Authorization: 'Bearer test_sk_c9gwZQHMyH0Rf46zhdQV012yuJOfbC5f5Qy30sFP'}
              };
              
              fetch(`https://pay.chargily.net/test/api/v2/checkouts/${id}`, options)
                .then(response => response.json())
                .then(
                   response=>{
                    const{id,amount,metadata}=response
                    const transaction = {
                        chargilyId: id,
                        amount: amount ? amount / 100 : 0,
                        plan: metadata[0]?.plan || "",
                        credits: Number(metadata[0]?.credits) || 0,
                        buyerId: metadata[0]?.buyerId || "",
                        createdAt: new Date(),
                        };
                      
                    // createTransaction(transaction)
                   }
                    
                    )
                .catch(err => console.error(err));

               
       
        }
      
      },[])
  return (
    <>
      <h2 className="h2-bold text-dark-600">{title}</h2>
      {subtitle && <p className="p-16-regular mt-4">{subtitle}</p>}
    </>
  )
}

export default Header