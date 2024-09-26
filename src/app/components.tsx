'use client'

import React from 'react'
import Link from 'next/link'
import { Breadcrumb } from '@/breadcrumb'

export const Header = () => {
  return (
    <div className="w-full bg-zinc-900/25 h-14 p-4 border border-zinc-900 rounded-xl">
      <Breadcrumb className="flex gap-2" >
        {({segment,name,pathname}) => {
          return <Link key={segment} href={pathname} className="underline hover:text-blue-500">{name}</Link>
        }}
      </Breadcrumb>
    </div>
  )
}
