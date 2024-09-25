'use client'

import { Breadcrumb, BreadcrumbItem } from "@/breadcrumb";
import Link from "next/link";

export default function Menu() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start w-full max-w-[720px]">
        <h1 className="text-xl">Current: Menu</h1>
        
        <div className="w-full bg-zinc-900/25 h-14 p-4 border border-zinc-900 rounded-xl">
          <Breadcrumb className="flex gap-2" >
            {(context) => {
              return context.breadcrumbs?.map(({title,href,key}) => (
                <Link key={key} href={href} className="underline hover:text-blue-500">{title}</Link>
              ))
            }} 
          </Breadcrumb>
        </div>

        <div className="flex gap-1.5 items-center w-full justify-start">
          <h1 className="text-zinc-500">Next Link:</h1>
          <Link href='/menu/products' className="underline hover:text-blue-500">Products</Link>
        </div>
      </main>
    </div>
  );
}
