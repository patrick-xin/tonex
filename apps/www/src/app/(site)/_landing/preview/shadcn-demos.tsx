'use client'

import { useRef } from 'react'
import {
  ContributionHistory,
  CoverArt,
  DividendIncome,
  Faq,
  IndexInvesting,
  KitchenIsland,
  LoginForm,
  NotificationSettings,
  PayoutThreshold,
  Preferences,
  ReceivingMethod,
  RecentTransactions,
  ReleaseCatalog,
  SavingsProgress,
  SignupForm,
  SocialLinks,
} from '../../../(app)/theme/(shadcn)/shadcn/blocks/_components'

export default function ShadcnDemos() {
  // why: Preferences / PayoutThreshold / RecentTransactions portal their
  // popups through this ref so the overlay lands back inside `.shadcn` scope.
  const portalRef = useRef<HTMLDivElement | null>(null)
  return (
    <div ref={portalRef} className="gap-12">
      <div className="m-px flex min-w-max gap-4">
        <div className="flex w-90 flex-col gap-4">
          <ContributionHistory />
          <SavingsProgress />
          <DividendIncome />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <IndexInvesting />
          <NotificationSettings />
          <ReceivingMethod />
          <SocialLinks />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <LoginForm />
          <Preferences ref={portalRef} />
          <Faq />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <SignupForm />
          <KitchenIsland />
          <PayoutThreshold ref={portalRef} />
        </div>
        <div className="flex w-105 flex-col gap-4">
          <ReleaseCatalog />
          <RecentTransactions ref={portalRef} />
          <CoverArt />
        </div>
      </div>
    </div>
  )
}
