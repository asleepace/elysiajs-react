import { unlink } from 'node:fs/promises'
import { template } from './template'
import { findImports } from './findImports'
import { findComponentSource } from './findComponentSource'
import { createClientSideJS } from './createClientSideJS'
import { writeToStream } from './writeToStream'
import React from 'react'

export type ReactPluginConfig = {
  tempDir?: string
  waitForStream?: boolean
  publicPath?: string
  verbose?: boolean
}

export type ReactPluginTemplate = (
  importStatement: string,
  initialProps: any
) => string | Promise<string>

/**
 * A simple class for handling server-side rendering of React components on the fly.
 * This class is available as a decorator named `reactPlugin` on the Elysia instance,
 * and can be used to server side render React components.
 *
 * NOTE: Generally you won't need to use this class directly, as it is used internally
 * to process responses that are React elements.
 */
export class ReactPlugin {
  /**
   * Default configuration for the ReactPlugin.
   */
  static defaultConfig = {
    waitForStream: true,
    publicPath: 'public',
    tempDir: 'src',
    verbose: false,
  } as const

  /**
   * Import statements which are extracted from the `Bun.main` file,
   * used to extract the source file of the component.
   */
  public sources: string[] = []
  /**
   * An array of client side js files that are generated by the plugin,
   * ideally these should be deleted when the plugin is stopped / started.
   */
  public clients: string[] = []

  /**
   * The template function that generates the client side js file, this
   * can be overridden by the user to customize the client side js file.
   */
  public template: ReactPluginTemplate = template

  /**
   * Create a new ReactPlugin instance with the given configuration.
   */
  constructor(public config: ReactPluginConfig) {}

  /**
   * Set the path to your public directory, this is where the client side
   * js files will be saved. Usually this will be the same as your `publicPath`
   * in your `staticPlugin` configuration.
   */
  set publicPath(publicPath: string) {
    if (this.isVerbose)
      console.log('[reactPlugin] setting publicPath:', publicPath)
    this.config.publicPath = publicPath
  }

  /**
   * When true this plugin will emit verbose logging to the console.
   */
  get isVerbose() {
    return this.config.verbose || ReactPlugin.defaultConfig.verbose
  }

  /**
   * The path to your public directory where the client side js files will be saved,
   * this should also include any subdirectories you want to save the files in, such
   * as `public/generated-clients/`
   */
  get publicPath() {
    return this.config.publicPath || ReactPlugin.defaultConfig.publicPath
  }

  /**
   * The temporary directory where the client side TS files are saved before being written
   * to the public directory. This should generally be in the same location as your Elysia
   * entrypoint. NOTE: The generated files are deleted after being written to the public
   * directory.
   */
  get tempDir() {
    return this.config.tempDir || ReactPlugin.defaultConfig.tempDir
  }

  /**
   * This flag determines if the plugin should wait for the stream to completely render before
   * returning the response. This is useful for ensuring that the stream is completely rendered
   * before sending it to the client.
   */
  get waitForStream() {
    return this.config.waitForStream || ReactPlugin.defaultConfig.waitForStream
  }

  /**
   * Returns true if the response is a React element, this is used to determine if the
   * response should be server side rendered by the plugin.
   */
  public isReact(response: any): response is React.ReactElement {
    return React.isValidElement(response)
  }

  /**
   * This method should be called once when the server first starts and will attempt to
   * source import locations for React components from the `Bun.main` file.
   */
  public async sourceFiles(main: string) {
    if (this.isVerbose) console.log('[reactPlugin] finding source files:', main)
    const sources = await findImports(main)
    if (this.isVerbose)
      console.log('[reactPlugin] found source files:', sources)
    this.sources = [...sources]
  }

  /**
   * Delete all generated client side js files when the server stops, this prevents the public
   * directory from being cluttered with client side js files that are no longer needed.
   */
  public async deleteClients() {
    if (this.isVerbose)
      console.log('[reactPlugin] deleting all clients:', this.clients)
    return Promise.all(this.clients.map(unlink))
  }

  /**
   * Once we generated a client side js file we saved the path to the file in the `clients` array,
   * then it can be re-used later to server side render the component. Generated files will include
   * a hash to uniquely identify the file, so that we can check if the file already exists before
   */
  public saveClient(publicFilePath: string) {
    if (this.isVerbose)
      console.log('[reactPlugin] saving client:', publicFilePath)
    this.clients.push(publicFilePath)
  }

  /**
   * Finds a previously generated client side js file by the file name.
   */
  public findClient(fileName: string): string | undefined {
    const found = this.clients.find((c) => c.includes(fileName))
    if (this.isVerbose)
      console.log(
        found
          ? `[reactPlugin] client found: ${found}`
          : `[reactPlugin] client not found: ${fileName}`
      )
    return found
  }

  /**
   * Attempts to server side render a React component, this method will extract the component
   */
  public async serverSideRender(
    component: React.ReactElement
  ): Promise<Response> {
    console.log('[reactPlugin] serverSideRender', component)

    // extract the component name and import statement
    const importStatement = await findComponentSource({
      sources: this.sources,
      component,
    })

    // create the client side js file
    const clientBundle = await createClientSideJS({
      publicPath: this.publicPath,
      verbose: this.isVerbose,
      clients: this.clients,
      tempDir: this.tempDir,
      importStatement,
    })

    // write the component to a stream
    const output = await writeToStream({
      waitForStream: this.waitForStream,
      publicPath: this.publicPath,
      clientBundle,
      component,
    })

    // output the stream
    return new Response(output, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
}
