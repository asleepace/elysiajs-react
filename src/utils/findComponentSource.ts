export type SourceConfig = {
  component: React.ReactElement
  sources: string[]
}

export async function findComponentSource({
  component,
  sources,
}: SourceConfig): Promise<string> {
  // extract the react node type
  const reactComponentType = component['type']

  // check if the react node is a function component
  if (typeof reactComponentType !== 'function') {
    throw new Error('Expected a function component')
  }

  // extract the function name from the react node
  const sourceFunctionName = reactComponentType.name

  // check if the function name is not empty
  if (!sourceFunctionName) {
    throw new Error('Expected a named function component')
  }

  // check if function name is in the sources
  const importStatement = sources.find((source) =>
    source.includes(sourceFunctionName)
  )

  // check if import statement is found
  if (!importStatement) {
    throw new Error('Import statement not found')
  }

  // extract the source file from the import statement
  return importStatement
}
