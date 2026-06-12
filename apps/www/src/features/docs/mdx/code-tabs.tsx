'use client'

import type * as React from 'react'
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

export function CodeBlockTabs({
  defaultValue,
  groupId,
  persist: _persist,
  children,
  ...props
}: {
  defaultValue?: string
  groupId?: string
  persist?: boolean
  children: React.ReactNode
}) {
  const stored = useUiPrefs((s) => (groupId ? s.tabGroupValues[groupId] : undefined))
  const setTabGroupValue = useUiPrefs((s) => s.actions.setTabGroupValue)

  const value = groupId ? (stored ?? defaultValue) : undefined

  const handleValueChange = (next: string) => {
    if (groupId) setTabGroupValue(groupId, next)
  }

  return (
    <Tabs
      className="gap-0"
      defaultValue={defaultValue}
      // controlled when groupId present so all instances on the page sync
      {...(groupId ? { value, onValueChange: handleValueChange } : {})}
      {...props}
    >
      {children}
    </Tabs>
  )
}

export function CodeBlockTabsList({ children }: { children: React.ReactNode }) {
  return (
    <TabsList className="w-full bg-surface-container border-b border-outline-variant/40 rounded-md rounded-b-none gap-2 px-2">
      <div className="flex items-center gap-2">{children}</div>
      <TabsIndicator className="bottom-0 left-0 h-0.5 bg-primary-container" />
    </TabsList>
  )
}

export function CodeBlockTabsTrigger({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <TabsTab
      className="text-on-surface-variant data-active:text-primary h-10 rounded-none"
      value={value}
    >
      {children}
    </TabsTab>
  )
}

export function CodeBlockTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsPanel value={value} className="rounded-t-none overflow-hidden [&_figure]:rounded-t-none">
      {children}
    </TabsPanel>
  )
}
