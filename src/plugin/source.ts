



export async function source(reactNode: React.ReactElement, sources: string[]) {
  // extract the react node type
  const reactNodeType = reactNode['type']
  console.log('[source] reactType', reactNodeType, typeof reactNodeType, reactNodeType.toString())

  // check if the react node is a function component
  if (typeof reactNodeType !== 'function') {
    throw new Error('Expected a function component')
  }

  // extract the function name from the react node
  const sourceFunctionName = reactNodeType.name

  // check if the function name is not empty
  if (!sourceFunctionName) {
    throw new Error('Expected a named function component')
  }

  // check if function name is in the sources
  const importStatement = sources.find((source) => source.includes(sourceFunctionName))

  // check if import statement is found
  if (!importStatement) {
    throw new Error('Import statement not found')
  }

  // extract the source file from the import statement
  return importStatement
}