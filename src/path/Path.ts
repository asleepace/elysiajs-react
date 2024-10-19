/**
 * Represents a path in the file system.
 */
export class Path {
  public value: string
  public children: Record<string, Path> = {}

  protected isRoot: boolean = true

  static from(path: string): Path {
    return new Path(path)
  }

  /**
   * Returns the longest common subpath of the given path strings,
   * output contains a leading slash.
   */
  static resolve(...strPaths: string[]): string | undefined {
    const [root, ...paths] = strPaths.map(Path.from)
    let shortestSharedPath = ''
    let isFirstRun = true
    for (const otherPath of paths) {
      const subpath = Path.findLongestSubpath(root, otherPath)
      if (subpath.length < shortestSharedPath.length) {
        shortestSharedPath = subpath
      } else if (isFirstRun) {
        shortestSharedPath = subpath
        isFirstRun = false
      }
    }

    return shortestSharedPath
  }

  static findLongestSubpath(a: Path, b: Path): string {
    if (a.value !== b.value) return ''
    const current = a.value

    let longestSubpath = ''
    for (const [_key, childA] of Object.entries(a.children)) {
      if (b.hasChild(childA)) {
        const childB = b.children[childA.value]
        const subpath = Path.findLongestSubpath(childA, childB)
        if (subpath.length > longestSubpath.length) {
          longestSubpath = subpath
        }
      }
    }

    return Path.join(current, longestSubpath)
  }

  static join(...paths: string[]): string {
    const splits = paths.map((path) => path.split('/'))
    const flattened = splits.flat(Infinity)
    const prefixed = Path.prefix(flattened.join('/'))
    return prefixed.replaceAll('//', '/')
  }

  static prefix(path: string): string {
    let output = path.trim()
    output = path.startsWith('/') ? output : `/${output}`
    output = path.endsWith('/') ? output.slice(0, -1) : output
    return output
  }

  constructor(public fullPath: string) {
    const [current, ...subpaths] = fullPath.split('/').filter(Boolean)
    this.value = current.replaceAll('/', '')
    this.insert(subpaths.join('/'))
  }

  equals(other: Path | undefined): boolean {
    if (!other) return false
    return this.value === other.value
  }

  hasChild(path: Path): boolean {
    return path.value in this.children
  }

  isLeaf(): boolean {
    return Object.keys(this.children).length === 0
  }

  insert(path: string): void {
    if (!path) return
    const child = new Path(path)
    child.isRoot = false
    this.children[child.value] = child
  }

  dirs(): string[] {
    if (this.isLeaf() && this.isRoot) {
      return [Path.prefix(this.value)]
    }
    if (this.isLeaf()) return [this.value]
    return Object.values(this.children)
      .map((child) => child.dirs())
      .map((child) => Path.join(this.value, ...child))
      .map(Path.prefix)
  }
}
