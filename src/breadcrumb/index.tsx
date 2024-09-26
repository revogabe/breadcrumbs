'use client'

/* ----------------------------------------------------------------------------
 * Imports
 * --------------------------------------------------------------------------*/

import React, { useLayoutEffect } from "react"
import { createContext } from "./create-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

/* ----------------------------------------------------------------------------
 * Functions
 * --------------------------------------------------------------------------*/

function nameCleaning(name: string) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/* ----------------------------------------------------------------------------
 * BreadcrumbProvider
 * --------------------------------------------------------------------------*/
type PrimitiveDivElement = React.ElementRef<'div'>
type PrimitiveDivProps = React.ComponentPropsWithoutRef<'div'>

type BreadcrumbItem = {
  name: string
  pathname: string
  segment: string
}

type BreadcrumbContextValue = {
  breadcrumbs: BreadcrumbItem[] | undefined
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void
}
interface BreadcrumbProviderProps extends PrimitiveDivProps {
  breadcrumbs?: BreadcrumbItem[]
}

const PROVIDER_NAME = 'BreadcrumbProvider'

export const [BreadcrumbContext, useBreadcrumbContext] = createContext<BreadcrumbContextValue>(PROVIDER_NAME)

export const BreadcrumbProvider = React.forwardRef<PrimitiveDivElement, BreadcrumbProviderProps>((props, ref) => {
  const { ...providerProps } = props
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>();
  console.log('breadcrumbs', breadcrumbs);

  function addBreadcrumb(breadcrumb: BreadcrumbItem) {
    if (!breadcrumbs) return;
    const breadcrumbIndex = breadcrumbs.findIndex((item) => item.segment === breadcrumb.segment);
    if (breadcrumbIndex !== -1) {
      const newBreadcrumbs = [...breadcrumbs];
      newBreadcrumbs[breadcrumbIndex] = breadcrumb;
      setBreadcrumbs(newBreadcrumbs);
      return
    }
  }

  React.useEffect(() => {
    function updateBreadcrumb() {
      const breadcrumb = pathname.split('/').filter(Boolean);
      const breadcrumbs = breadcrumb.map((item, index) => ({
        name: nameCleaning(item),
        pathname: '/' + breadcrumb.slice(0, index + 1).join('/'),
        segment: `/${item}`,
      }));
      const breadcrumbWithHome = [{name: 'Home', pathname: '/', segment: ''}, ...breadcrumbs];
      setBreadcrumbs(breadcrumbWithHome);
    } 
    
    updateBreadcrumb();
  }, [pathname]);


  return (
    <BreadcrumbContext breadcrumbs={breadcrumbs} addBreadcrumb={addBreadcrumb}>
      <div ref={ref} {...providerProps}  />
    </BreadcrumbContext>
  )
})


/* -------------------------------------------------------------------------------------------------
 * BreadcrumbLink
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbLinkElement = React.ElementRef<typeof Link>
type LinkProps = Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'>
interface BreadcrumbLinkProps extends BreadcrumbItem, LinkProps {}

const LINK_NAME = 'BreadcrumbLink'

export const BreadcrumbLink = React.forwardRef<BreadcrumbLinkElement, BreadcrumbLinkProps>((props) => {
  const { pathname, ...linkProps } = props
  return <Link href={props.pathname} {...linkProps}>{props.name}</Link>
})

BreadcrumbLink.displayName = LINK_NAME

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'BreadcrumbItem'

export const BreadcrumbItem = (props: BreadcrumbItem & { children: React.ReactNode }) => {
  const context = useBreadcrumbContext(ITEM_NAME)

  useLayoutEffect(() => {
    context.addBreadcrumb(props)
  }, [])

  return null
}

BreadcrumbItem.displayName = ITEM_NAME

/* -------------------------------------------------------------------------------------------------
 * BreadCrumb
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbProps extends Omit<PrimitiveDivProps, 'children'> {
  children?: ((item: BreadcrumbItem) => React.ReactNode)
}

const BREADCRUMB_NAME = 'Breadcrumb'

export const Breadcrumb = React.forwardRef<PrimitiveDivElement, BreadcrumbProps>((props, ref) => {
  const { children, ...rootProps } = props;
  const context = useBreadcrumbContext(BREADCRUMB_NAME);
  
  const content = () => {
    return context.breadcrumbs?.map((item) => {
      if (typeof children === 'function') {
        return children(item)
      }
      return <BreadcrumbLink {...item} />
    })
  }
  
  return (
    <div ref={ref} {...rootProps}>
      {content()}
    </div>
  );
});

Breadcrumb.displayName = BREADCRUMB_NAME