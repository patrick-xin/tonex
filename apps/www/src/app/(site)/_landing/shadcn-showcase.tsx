'use client'

import { useRef } from 'react'
import { ContributionHistory } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/contribution-history'
import { CoverArt } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/cover-art'
import { DividendIncome } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/dividend-income'
import { Faq } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/faq'
import { IndexInvesting } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/index-investing'
import { KitchenIsland } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/kitchen-island'
import { LoginForm } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/login-form'
import { NotificationSettings } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/notification-settings'
import { PayoutThreshold } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/payout-threshold'
import { Preferences } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/preferences'
import { ReceivingMethod } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/receiving-method'
import { RecentTransactions } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/recent-transactions'
import { ReleaseCatalog } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/release-catalog'
import { SavingsProgress } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/savings-progress'
import { SignupForm } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/signup-form'
import { SocialLinks } from '../../(app)/theme/(shadcn)/shadcn/blocks/_components/social-links'

export function ShadcnShowcaseSection() {
  // why: Preferences / PayoutThreshold / RecentTransactions portal their
  // popups through this ref so the overlay lands back inside `.shadcn` scope.
  const portalRef = useRef<HTMLDivElement | null>(null)
  return (
    <section className="shadcn relative flex h-dvh flex-col bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 pt-20 pb-8 text-center">
        <h2 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          Pick once. Every block follows.
        </h2>
        <p className="max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
          Real shadcn primitives — cards, forms, charts — recolor in place from a single seed. What
          you see is the exported token, not a screenshot.
        </p>
      </div>

      <div
        ref={portalRef}
        className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 pb-8 mask-[linear-gradient(to_bottom,black_80%,transparent)]"
      >
        <div className="m-px flex min-w-max gap-6">
          <div className="flex w-90 flex-col gap-6">
            <ContributionHistory />
            <SavingsProgress />
            <DividendIncome />
          </div>
          <div className="flex w-90 flex-col gap-6">
            <IndexInvesting />
            <NotificationSettings />
            <ReceivingMethod />
            <SocialLinks />
          </div>
          <div className="flex w-90 flex-col gap-6">
            <LoginForm />
            <Preferences ref={portalRef} />
            <Faq />
          </div>
          <div className="flex w-90 flex-col gap-6">
            <SignupForm />
            <KitchenIsland />
            <PayoutThreshold ref={portalRef} />
          </div>
          <div className="flex w-[420px] flex-col gap-6">
            <ReleaseCatalog />
            <RecentTransactions ref={portalRef} />
            <CoverArt />
          </div>
        </div>
      </div>
    </section>
  )
}
