"use client"

import React from "react"
import { Breadcrumb } from "@/breadcrumb"

export const Header = () => {
  return (
    <div className="w-full bg-zinc-900/25 h-14 p-4 border border-zinc-900 rounded-xl">
      <Breadcrumb className="flex gap-2" />
    </div>
  )
}
