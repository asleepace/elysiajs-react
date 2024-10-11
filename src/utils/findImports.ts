


/**
 * Find all import statements in a file and return each import statement 
 * as a string in an array of strings.
 */
export async function findImports(file: string): Promise<string[]> {
  const code = await Bun.file(file).text()
  const imports = code.match(/import\s+.*\s+from\s+['"].*['"]/g)
  if (!imports) {
    console.warn('[reactPlugin] could not find any imports in', file)
    return []
  }
  return [...imports]
}

/**
 * Find the source file from an import statement.
 */
export function findSourceFileFromImport(importStatement: string): string {
  const match = importStatement.match(/from\s+['"](.*)['"]/)
  if (!match) {
    throw new Error('Invalid import statement')
  }
  return match[1]
}