'use client'

import { useEffect } from 'react'

interface StatusBarSyncProps {
  color?: string
  appleStyle?: 'default' | 'black' | 'black-translucent'
}

interface MetaSnapshot {
  element: HTMLMetaElement
  previousContent: string | null
  created: boolean
}

function upsertMeta(name: string, content: string): MetaSnapshot {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  const created = !element

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }

  const previousContent = element.getAttribute('content')
  element.setAttribute('content', content)

  return { element, previousContent, created }
}

function restoreMeta(snapshot: MetaSnapshot) {
  if (snapshot.created) {
    snapshot.element.remove()
    return
  }

  if (snapshot.previousContent === null) {
    snapshot.element.removeAttribute('content')
    return
  }

  snapshot.element.setAttribute('content', snapshot.previousContent)
}

export function StatusBarSync({ color = '#ffffff', appleStyle = 'default' }: StatusBarSyncProps) {
  useEffect(() => {
    const themeSnapshot = upsertMeta('theme-color', color)
    const appleSnapshot = upsertMeta('apple-mobile-web-app-status-bar-style', appleStyle)

    return () => {
      restoreMeta(themeSnapshot)
      restoreMeta(appleSnapshot)
    }
  }, [appleStyle, color])

  return null
}
