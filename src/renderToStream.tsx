import React from 'react'
import { InitialProps } from './server/serverRender'
import { template } from './utils/template'
import { renderToReadableStream } from 'react-dom/server.browser'

/**
 * Render a react element to a stream by importing the source file from
 * the asset map and rendering the element to a readable stream.
 */
export async function renderToStream(element: any) {
  if (!React.isValidElement(element)) {
    return element
  }

  const pageProps = element.props as InitialProps<{}>
  const sourceFile = pageProps.assetMap.sourceFile

  if (!sourceFile) throw new Error('Missing source file in asset map')

  const clientTemplate = await createClientTemplate(sourceFile)

  const buildOutput = await Bun.build({
    entrypoints: [clientTemplate],
    outdir: './public',
    publicPath: './public',
    naming: {
      entry: '[name].[ext]',
      asset: '[name].[ext]',
    },
  })

  console.log('[renderToStream] buildOutput:', buildOutput.success)

  const sources = buildOutput.outputs
    .map((output) => output.path)
    .map((path) => path.slice(path.indexOf('/public')))

  console.log('[renderToStream] sources:', sources)

  const bootstrapScripts = sources.filter((source) => source.endsWith('.js'))
  const assets = sources.filter((source) => !source.endsWith('.js'))
  const assetMap = mapBuildToAssetMap(pageProps.assetMap, assets)

  const props = Object.assign({}, pageProps, { assetMap })

  const source = await import(sourceFile)
  const Component = source.default as React.ComponentType<InitialProps<{}>>

  const reactElement = React.createElement(Component, props)
  const stream = await renderToReadableStream(reactElement, {
    bootstrapScripts,
    bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${JSON.stringify(
      pageProps
    )}`,
  })

  return new Response(stream)
}

/**
 * Find the source file and use it to create a client template,
 * the pageProps must contain `sourceFile` in the asset map.
 */
async function createClientTemplate(sourceFile: string) {
  const relativePath = Bun.fileURLToPath(sourceFile)

  const sanitizedPath = relativePath.replace('.tsx', '')
  const clientTemplate = template(`import App from '${sanitizedPath}'`)

  const tempClientFileName = './client.tsx'

  // write temp file that will be bundled, then deleted
  await Bun.write(tempClientFileName, clientTemplate).catch(console.error)

  return tempClientFileName
}

/**
 * We need to map the output asset files to the asset map.
 */
function mapBuildToAssetMap(input: Record<string, string>, output: string[]) {
  Object.entries(input).reduce((assetMap, [key, value]) => {
    const fileName = getFileName(value)

    // remove the sourceFile from the asset map
    if (fileName.endsWith('.tsx')) {
      delete assetMap[key]
      return assetMap
    }

    const assetPath = output.find((path) => path.includes(fileName))
    if (!assetPath) {
      console.error(`[mapBuildToAssetMap] Asset not found: ${fileName}`)
      delete assetMap[key]
      return assetMap
    }
    assetMap[key] = assetPath
    return assetMap
  }, input)
}

function getFileName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}
