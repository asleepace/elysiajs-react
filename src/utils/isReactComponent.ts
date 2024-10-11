



/**
 * Helper function to check if an item is a React component.
 */
export function isReactComponent(item: any): item is React.ReactElement {
  return item && item.$$typeof === Symbol.for('react.element')
}