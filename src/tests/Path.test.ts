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

  test('should initialize single path', () => {
    const path = Path.from('src')
    expect(path.value).toBe('src')
    expect(path.dirs()).toEqual(['/src'])
  })
})
