
import MobileNav from '@/components/Shared/MobileNav'
import Sidebar from '@/components/Shared/Sidebar'
import React, { ReactNode } from 'react'

export default function Layout({children}:{children:ReactNode}) {
  return (
    <main className='root'>
       <Sidebar/>
       <MobileNav/>
    <div className='root-container'>
<div className='wrapper'>
{children}
</div>
    </div>
    </main>
  )
}
