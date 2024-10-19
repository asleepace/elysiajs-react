import { test, describe, expect } from 'bun:test'
import { Path } from '../path/Path'

describe('Path', () => {
  test('should initialize path correctly', () => {
    const path = Path.from('/src/example/path')
    expect(path.value).toBe('src')
    expect(path.dirs()).toEqual(['/src/example/path'])
  })

  test('should initialize path without leading slash', () => {
    const path = Path.from('src/example/path')
    expect(path.value).toBe('src')
    expect(path.dirs()).toEqual(['/src/example/path'])
  })

  test('should initialize path without leading slash with trailing slash', () => {
    const path = Path.from('src/example/path/')
    expect(path.value).toBe('src')
    expect(path.dirs()).toEqual(['/src/example/path'])
  })

  test('should initialize path (single)', () => {
    const path = Path.from('src')
    expect(path.value).toBe('src')
    expect(path.dirs()).toEqual(['/src'])
  })

  test('should resolve 2 paths correctly', () => {
    const a = '/src/test/example/a/b/c'
    const b = '/src/test/example/x/y/x'
    const resolved = Path.resolve(a, b)
    expect(resolved).toBe('/src/test/example')
  })

  test('should resolve 3 paths correctly', () => {
    const a = '/src/test/example/a/b/c'
    const b = '/src/test/example/x/y/x'
    const c = '/src/test'
    const resolved = Path.resolve(a, b, c)
    expect(resolved).toBe(c)
  })
})
