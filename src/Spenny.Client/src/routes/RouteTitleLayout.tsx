// Sets document.title from the active route (child routes render via Outlet).
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { documentTitleForPath } from '@/lib/routeDocumentTitle'

export function RouteTitleLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = documentTitleForPath(pathname)
  }, [pathname])

  return <Outlet />
}
