const previews = new Set(['default', 'scheduled', 'empty', 'single', 'template', 'filled', 'past', 'errors', 'save-error', 'welcome', 'spaces', 'items', 'cycles', 'custom'])

export function onboardingDestination({ pathname, search, completed, development = false }) {
  const preview = new URLSearchParams(search).get('preview')
  const allowedPreview = pathname === '/' ? ['welcome', 'spaces', 'items', 'cycles', 'custom'].includes(preview) : previews.has(preview)
  if (development && (allowedPreview || /\/(?:items|history)\/preview-[^/]+/.test(pathname))) return null
  if (pathname === '/') return completed ? '/home' : null
  return completed ? null : '/'
}
