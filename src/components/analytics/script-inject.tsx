import { useEffect } from 'react'

/**
 * Injects a script tag into document.head. Scripts added by React may not execute;
 * this runs in useEffect so the script runs in the browser.
 */
export function ScriptInject({
  src,
  async,
  defer,
  id,
  dataAttributes,
  inlineHtml,
}: {
  src?: string
  async?: boolean
  defer?: boolean
  id?: string
  dataAttributes?: Record<string, string>
  inlineHtml?: string
}) {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    const script = document.createElement('script')
    if (id) script.id = id
    if (src) script.src = src
    if (async) script.async = true
    if (defer) script.defer = true
    if (inlineHtml) script.textContent = inlineHtml
    if (dataAttributes) {
      for (const [key, value] of Object.entries(dataAttributes)) {
        script.setAttribute(
          `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
          value
        )
      }
    }
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
    // Run once on mount; analytics scripts only need to be injected once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
