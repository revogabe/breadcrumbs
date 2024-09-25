'use client'

/* ----------------------------------------------------------------------------
 * Imports
 * --------------------------------------------------------------------------*/

import React from "react"
import { createContext } from "./create-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

/* ----------------------------------------------------------------------------
 * BreadcrumbProvider
 * --------------------------------------------------------------------------*/

type BreadcrumbItem = {
  key: string
  title: string
  href: string
}

type PrimitiveDivElement = React.ElementRef<'div'>
type PrimitiveDivProps = React.ComponentPropsWithoutRef<'div'>
type BreadcrumbContextValue = {
  breadcrumbs: BreadcrumbItem[] | undefined
}
interface BreadcrumbProviderProps extends PrimitiveDivProps {
  breadcrumbs?: BreadcrumbItem[]
}

const PROVIDER_NAME = 'BreadcrumbProvider'

export const [BreadcrumbContainer, useBreadcrumbContext] = createContext<BreadcrumbContextValue>(PROVIDER_NAME)

export const BreadcrumbProvider = React.forwardRef<PrimitiveDivElement, BreadcrumbProviderProps>((props, ref) => {
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>();
  const { ...providerProps } = props

  React.useEffect(() => {
    function updateBreadcrumb() {
      const breadcrumb = window.location.pathname.split('/').filter(Boolean);
      const breadcrumbs = breadcrumb.map((item, index) => ({
        key: `${item}-${index}`,
        title: item,
        href: '/' + breadcrumb.slice(0, index + 1).join('/'),
      }));
      const breadcrumbWithHome = [{ key: 'home-0', title: 'home', href: '/' }, ...breadcrumbs];
      setBreadcrumbs(breadcrumbWithHome);
    } 
    
    updateBreadcrumb();
  }, [pathname]);


  return (
    <BreadcrumbContainer breadcrumbs={breadcrumbs}>
      <div ref={ref} {...providerProps}  />
    </BreadcrumbContainer>
  )
})

BreadcrumbProvider.displayName = PROVIDER_NAME



/* -------------------------------------------------------------------------------------------------
 * BreadcrumbItem
 * -----------------------------------------------------------------------------------------------*/
type BreadcrumbCallbackProps = {
  key: string
  title?: string
  href?: string
  isActive?: boolean
}
type BreadcrumbItemElement = React.ElementRef<typeof Link>
export interface BreadcrumbItemProps extends BreadcrumbItem {
  isActive?: boolean
  children?: ({key,href,title,isActive}: BreadcrumbCallbackProps) => React.ReactNode
}

const ITEM_NAME = 'BreadcrumbItem'

export const BreadcrumbItem = React.forwardRef<BreadcrumbItemElement, BreadcrumbItemProps>((props) => {
  return props.children ? props.children(props) : <Link href={props.href}>{props.title}</Link>
})

BreadcrumbItem.displayName = ITEM_NAME


/* -------------------------------------------------------------------------------------------------
 * BreadCrumb
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbProps extends Omit<PrimitiveDivProps, 'children'> {
  children?: React.ReactNode | ((context: BreadcrumbContextValue) => React.ReactNode)
}

const BREADCRUMB_NAME = 'Breadcrumb'

export const Breadcrumb = React.forwardRef<PrimitiveDivElement, BreadcrumbProps>((props, ref) => {
  const { children, ...rootProps } = props;
  
  const context = useBreadcrumbContext(BREADCRUMB_NAME);
  if (!context.breadcrumbs) return null;
  const content = () => {
    if (!children) return context.breadcrumbs?.map((item) => <BreadcrumbItem {...item} />)
    if (typeof children === 'function') return children(context)
    return children
  }
  

  return (
    <div ref={ref} {...rootProps}>
      {content()}
    </div>
  );
});

Breadcrumb.displayName = BREADCRUMB_NAME