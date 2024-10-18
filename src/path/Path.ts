/**
 * Represents a path in the file system.
 */
export class Path {
  public value: string
  public children: Path[] = []

  protected isRoot: boolean = true

  static from(path: string): Path {
    return new Path(path)
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

  equals(other: Path): boolean {
    return this.value === other.value
  }

  isLeaf(): boolean {
    return this.children.length === 0
  }

  insert(path: string): void {
    if (!path) return
    const child = new Path(path)
    child.isRoot = false
    this.children.push(child)
  }

  dirs(): string[] {
    if (this.isLeaf() && this.isRoot) {
      return [Path.prefix(this.value)]
    }
    if (this.isLeaf()) return [this.value]
    return this.children
      .map((child) => child.dirs())
      .map((child) => Path.join(this.value, ...child))
      .map(Path.prefix)
  }
}
