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
