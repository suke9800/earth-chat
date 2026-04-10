import { describe, expect, test } from 'bun:test'
import { getDeployPathConfig } from '../src/lib/deployment-path'

describe('deployment path config', () => {
  test('returns root paths when no repository is provided', () => {
    // #given
    const repositoryName = ''

    // #when
    const config = getDeployPathConfig(repositoryName)

    // #then
    expect(config.base).toBe('/')
    expect(config.scope).toBe('/')
    expect(config.startUrl).toBe('/')
  })

  test('returns repository-scoped paths for GitHub Pages project sites', () => {
    // #given
    const repositoryName = 'earth-chat'

    // #when
    const config = getDeployPathConfig(repositoryName)

    // #then
    expect(config.base).toBe('/earth-chat/')
    expect(config.scope).toBe('/earth-chat/')
    expect(config.startUrl).toBe('/earth-chat/')
  })

  test('normalizes leading and trailing slashes in the repository name', () => {
    // #given
    const repositoryName = '/earth-chat/'

    // #when
    const config = getDeployPathConfig(repositoryName)

    // #then
    expect(config.base).toBe('/earth-chat/')
    expect(config.scope).toBe('/earth-chat/')
    expect(config.startUrl).toBe('/earth-chat/')
  })
})
