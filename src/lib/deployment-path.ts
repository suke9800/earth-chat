export type DeployPathConfig = {
  base: string
  scope: string
  startUrl: string
}

export function getDeployPathConfig(repositoryName?: string | null): DeployPathConfig {
  const normalizedRepositoryName = String(repositoryName ?? '').trim().replace(/^\/+|\/+$/g, '')

  if (!normalizedRepositoryName) {
    return {
      base: '/',
      scope: '/',
      startUrl: '/',
    }
  }

  const repositoryBase = `/${normalizedRepositoryName}/`

  return {
    base: repositoryBase,
    scope: repositoryBase,
    startUrl: repositoryBase,
  }
}
