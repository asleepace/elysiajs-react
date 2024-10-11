export function href(path: string) {
  return new HREF(path)
}

class HREF {
  components: string[] = []

  constructor(path: string) {
    this.components = path.split('/')
  }

  get ext() {
    const parts = this.last.split('.').pop()
    if (!parts) throw new Error('No extension in path')
    return parts
  }

  get length() {
    return this.components.length
  }

  get last() {
    if (this.length === 0) throw new Error('No components in path')
    const last = this.components.at(-1)
    if (!last) throw new Error('No last component in path')
    return last
  }

  prepend(...components: string[]) {
    const removeRelative = components.filter((component) => component !== '.')
    this.components = components.concat(removeRelative)
    return this
  }

  toString() {
    return this.components.join('/').replace('//', '/').trim()
  }
}
