import { BunPlugin } from 'bun'
import { href } from './href'

export type ClientBuildPluginConfig = {
  publicDir: string
}

/**
 * The ClientBuildPlugin is a plugin for Bun that allows you to build client side
 * js files on the fly for each React component.
 */
export const clientBuildPlugin = ({
  publicDir,
}: ClientBuildPluginConfig): BunPlugin => ({
  name: 'reactBuildPlugin',
  setup(build) {
    build.onLoad({ filter: /\.tsx$/ }, async (args) => {
      console.log('[clientBuildPlugin] args', args)
      let text = await Bun.file(args.path).text()

      findLinkHref(text).forEach(([full, partial]) => {
        console.log('[clientBuildPlugin] replacing', {
          full,
          partial,
        })
        console.log('[clientBuildPlugin] @@@', partial)
        const path = href(partial)
        const publicFile = full.replace(partial, `${publicDir}${path.last}`)
        text = text.replace(full, publicFile)
      })

      return {
        contents: text,
        loader: 'tsx',
      }
    })
  },
})

export function findLinkHref(text: string) {
  const linkHrefRegex = /<link\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>/ig
  const matches = text.matchAll(linkHrefRegex)
  if (!matches) return []

  const linkHref = [...matches]
  console.log('[clientBuildPlugin] linkHref', linkHref)
  return linkHref
}
