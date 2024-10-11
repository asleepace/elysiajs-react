import { clientBuildPlugin } from './clientBuildPlugin'
import { template } from './template'
import { unlink } from 'node:fs/promises'

export type ClientJS = {
  importStatement: string
  publicPath: string
  tempDir: string
  clients: string[]
  verbose?: boolean
}

export type ReactBundledCode = {
  clientSideJS: string
  extraModules: string[]
  clientTempTS: string
}

export async function createClientSideJS<T extends {}>({
  importStatement,
  publicPath,
  clients,
  tempDir,
  verbose,
}: ClientJS): Promise<ReactBundledCode> {
  // extract the source file from the import statement
  const sourceFile = importStatement.split(' from ').pop()
  console.log('[reactPlugin] sourceFile', sourceFile)

  // generate the client side js file
  const generated = template(`import App from ${sourceFile};`)

  // generate a hash to uniquely identify the file
  const fileHash = Bun.hash(generated)

  // create a temp file path
  const tempEntryFile = `${tempDir}/client-${fileHash}.tsx`
  const clientJSFile = `client-${fileHash}.js`

  console.log('[reactPlugin] tempEntryFile', tempEntryFile)

  // check if the client side js file already exists
  const existingFile = clients.find((client) => client.includes(clientJSFile))

  // return the client side js file if it already exists
  if (existingFile) {
    console.log(
      '[reactPlugin] client side js file already exists',
      existingFile
    )
    // return existingFile
  }

  // write the generated source to a temp file
  await Bun.write(tempEntryFile, generated)

  if (verbose) console.log('[reactPlugin] generating', generated)

  // build the client side js file
  const build = await Bun.build({
    entrypoints: [tempEntryFile],
    plugins: [
      // clientBuildPlugin({
      //   publicDir: publicPath,
      // }),
    ],
    naming: {
      entry: clientJSFile,
      asset: '[name].[ext]',
    },
    outdir: publicPath,
    minify: true,
  })

  if (verbose) {
    console.log('[reactPlugin] build', build)
  }

  if (!build.success) {
    console.error('[reactPlugin] build failed', build.outputs)
    throw new Error('Failed bundling client side js')
  } else {
    unlink(tempEntryFile).catch(console.warn)
  }

  const reactBundledCode = build.outputs.reduce(
    (source, output) => {
      if (output.path.endsWith(clientJSFile)) {
        source.clientSideJS = output.path
      } else {
        source.extraModules.push(output.path)
      }
      return source
    },
    {
      clientSideJS: '',
      clientTempTS: tempEntryFile,
      extraModules: [],
    } as ReactBundledCode
  )

  const clientSideJS = build.outputs[0].path

  if (!clientSideJS) throw new Error('Client side JS file not found')

  // add the client side js file to the clients array
  clients.push(clientSideJS)

  return reactBundledCode
}
