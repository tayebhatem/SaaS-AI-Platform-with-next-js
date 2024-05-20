import React, { ReactNode } from 'react'

export default function Layout({children}:{children:ReactNode}) {
  return (
    <main className='auth'>
   {children}
    </main>
  )
}
