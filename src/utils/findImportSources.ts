type ImportStatement = {
  type: 'static' | 'dynamic'
  source: string
  imported: string[]
}

export function findImportSources(fileContent: string): ImportStatement[] {
  const imports: ImportStatement[] = []

  // Regular expression for static imports
  const staticImportRegex =
    /import\s+(?:(\*\s+as\s+\w+)|(\{\s*[\w\s,]+\})|(\w+))?\s*(?:,\s*(?:(\*\s+as\s+\w+)|(\{\s*[\w\s,]+\})|(\w+)))?\s+from\s+['"]([^'"]+)['"]/g

  // Regular expression for dynamic imports
  const dynamicImportRegex =
    /(?:const|let|var)\s+(?:\{([^}]+)\}|\w+)\s*=\s*await\s+import\(['"]([^'"]+)['"]\)/g

  let match

  // Extract static imports
  while ((match = staticImportRegex.exec(fileContent)) !== null) {
    const [
      _,
      star,
      namedImports,
      defaultImport,
      star2,
      namedImports2,
      defaultImport2,
      source,
    ] = match
    const imported: string[] = []

    if (star) imported.push(star.trim())
    if (namedImports)
      imported.push(
        ...namedImports
          .replace(/[{}]/g, '')
          .split(',')
          .map((s) => s.trim())
      )
    if (defaultImport) imported.push(defaultImport.trim())
    if (star2) imported.push(star2.trim())
    if (namedImports2)
      imported.push(
        ...namedImports2
          .replace(/[{}]/g, '')
          .split(',')
          .map((s) => s.trim())
      )
    if (defaultImport2) imported.push(defaultImport2.trim())

    imports.push({
      type: 'static',
      source,
      imported: imported.filter(Boolean),
    })
  }

  // Extract dynamic imports
  while ((match = dynamicImportRegex.exec(fileContent)) !== null) {
    const [_, importedItems, source] = match
    const imported = importedItems
      .split(',')
      .map((s) => s.replace('default:', '').trim())

    imports.push({
      type: 'dynamic',
      source,
      imported: imported.filter(Boolean),
    })
  }

  return imports
}
