import React, { Children } from 'react'

export type HTMLHoistingProps = React.PropsWithChildren<{}>

export function HTMLHoisting({ children }: HTMLHoistingProps) {
  console.log('[HTMLHoisting] children', children)
  enumerateReactChildren(children)
  return children
}

export function enumerateReactChildren(children: React.ReactNode) {
  Object.keys(children as any).forEach((key) => {
    const value = (children as any)[key]
    console.log('[enumerateReactChildren]', { [key]: value })
  })

  return Children.map(children, (child, index) => {
    console.log('[enumerateReactChildren] child', child, index)

    // enumerateReactChildren(child)

    return child
  })
}
