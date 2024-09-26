"use client"

/* ----------------------------------------------------------------------------
 * Imports
 * --------------------------------------------------------------------------*/

import React, { ForwardedRef, useCallback, useLayoutEffect } from "react"
import { createContext } from "./create-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

/* ----------------------------------------------------------------------------
 * Functions
 * --------------------------------------------------------------------------*/

function nameCleaning(name: string) {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

/* ----------------------------------------------------------------------------
 * BreadcrumbProvider
 * --------------------------------------------------------------------------*/
type PrimitiveDivElement = React.ElementRef<"div">
type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">

type BreadcrumbItem = {
  segment: string
  name?: string
  pathname?: string
}

type BreadcrumbContextValue = {
  breadcrumbs: BreadcrumbItem[] | undefined
  addBreadcrumb: (
    breadcrumb: BreadcrumbItem & {
      ref: ForwardedRef<BreadcrumbLinkElement>
    }
  ) => void
}
interface BreadcrumbProviderProps extends PrimitiveDivProps {
  breadcrumbs?: BreadcrumbItem[]
}

const PROVIDER_NAME = "BreadcrumbProvider"

export const [BreadcrumbContext, useBreadcrumbContext] =
  createContext<BreadcrumbContextValue>(PROVIDER_NAME)

export const BreadcrumbProvider = React.forwardRef<
  PrimitiveDivElement,
  BreadcrumbProviderProps
>((props, ref) => {
  const { ...providerProps } = props
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([])

  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    setBreadcrumbs((breadcrumbs) => {
      if (!breadcrumbs) return breadcrumbs
      const breadcrumbIndex = breadcrumbs.findIndex(
        (item) => item.segment === breadcrumb.segment
      )
      if (breadcrumbIndex !== -1) {
        const newBreadcrumbs = [...breadcrumbs]
        newBreadcrumbs[breadcrumbIndex] = {
          ...newBreadcrumbs[breadcrumbIndex],
          ...breadcrumb,
        }
        return newBreadcrumbs
      }
      return breadcrumbs
    })
  }, [])

  React.useEffect(() => {
    function updateBreadcrumb() {
      setBreadcrumbs((prev) => {
        const breadcrumb = pathname.split("/").filter(Boolean)
        const breadcrumbs = breadcrumb.map((item, index) => {
          const pathname = "/" + breadcrumb.slice(0, index + 1).join("/")
          const findBreadcrumb = prev.find((item) => item.pathname === pathname)
          if (findBreadcrumb) {
            return {
              ...findBreadcrumb,
              name: nameCleaning(item),
              pathname,
              segment: item,
            }
          }
          return {
            name: nameCleaning(item),
            pathname,
            segment: item,
          }
        })
        const breadcrumbWithHome = [
          { name: "Home", pathname: "/", segment: "" },
          ...breadcrumbs,
        ]
        return breadcrumbWithHome
      })
    }

    updateBreadcrumb()
  }, [pathname])

  return (
    <BreadcrumbContext breadcrumbs={breadcrumbs} addBreadcrumb={addBreadcrumb}>
      <div ref={ref} {...providerProps} />
    </BreadcrumbContext>
  )
})

BreadcrumbProvider.displayName = PROVIDER_NAME

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbLink
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbLinkElement = React.ElementRef<typeof Link>
type LinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href" | "children"
>
interface BreadcrumbLinkProps extends BreadcrumbItem, LinkProps {
  children?: React.ReactNode | ((item: BreadcrumbItem) => React.ReactNode)
}

const LINK_NAME = "BreadcrumbLink"

export const BreadcrumbLink = React.forwardRef<
  BreadcrumbLinkElement,
  BreadcrumbLinkProps
>((props, ref) => {
  const { children, ...linkProps } = props
  if (!props.pathname) return null

  return typeof children === "function" ? (
    children(props)
  ) : (
    <Link ref={ref} href={props.pathname} {...linkProps}>
      {children ?? props.name}
    </Link>
  )
})

BreadcrumbLink.displayName = LINK_NAME

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "BreadcrumbItem"

export const BreadcrumbItem = React.forwardRef<
  BreadcrumbLinkElement,
  BreadcrumbLinkProps
>((props, ref) => {
  const context = useBreadcrumbContext(ITEM_NAME)
  const { addBreadcrumb } = context

  useLayoutEffect(() => {
    addBreadcrumb({ ...props, ref })
  }, [addBreadcrumb, props, ref])

  return null
})

BreadcrumbItem.displayName = ITEM_NAME

/* -------------------------------------------------------------------------------------------------
 * BreadCrumb
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbProps extends Omit<PrimitiveDivProps, "children"> {
  children?: (item: BreadcrumbItem) => React.ReactNode
}

const BREADCRUMB_NAME = "Breadcrumb"

export const Breadcrumb = React.forwardRef<
  PrimitiveDivElement,
  BreadcrumbProps
>((props, ref) => {
  const { children, ...rootProps } = props
  const context = useBreadcrumbContext(BREADCRUMB_NAME)
  const pathname = usePathname()

  const content = () => {
    return context.breadcrumbs?.map(
      (
        item: BreadcrumbItem & {
          children?:
            | React.ReactNode
            | ((item: BreadcrumbItem) => React.ReactNode)
        }
      ) => {
        if (typeof children === "function") {
          const render = children(item) as JSX.Element
          if (!render) return null
          return React.cloneElement(
            render,
            item,
            item.children
              ? typeof item.children === "function"
                ? item.children(item)
                : item.children
              : item.name
          )
        }
        return (
          <BreadcrumbLink
            key={item.pathname}
            className={`text-neutral-500 ${
              pathname === item.pathname && "text-dark dark:text-white"
            }`}
            {...item}
          />
        )
      }
    )
  }

  return (
    <div ref={ref} {...rootProps}>
      {content()}
    </div>
  )
})

Breadcrumb.displayName = BREADCRUMB_NAME
