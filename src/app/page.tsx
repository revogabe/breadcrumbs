import { Breadcrumb } from "@/breadcrumb";
import Link from "next/link";

export default function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start w-full max-w-[720px]">
        <div className="flex gap-1.5 items-center w-full justify-start">
          <h1 className="text-zinc-500">Next Link:</h1>
          <Link href='/menu' className="underline hover:text-blue-500">Menu</Link>
        </div>
      </main>
    </div>
  );
}
