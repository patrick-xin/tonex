import type { source } from './source'

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed')

  return `---
title: ${page.data.title}
description: ${page.data.description}
path: ${page.url}
---
${processed}`
}
