



export async function findImports(file: string): Promise<string[]> {
  const code = await Bun.file(file).text()
  const imports = code.match(/import\s+.*\s+from\s+['"].*['"]/g)
  if (!imports) {
    console.log('[findImports] No imports found')
    return []
  }

  return [...imports]
}

export function findSourceFileFromImport(importStatement: string): string {
  const match = importStatement.match(/from\s+['"](.*)['"]/)
  if (!match) {
    throw new Error('Invalid import statement')
  }
  return match[1]
}