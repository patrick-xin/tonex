'use client'

import { useShadcn } from '../../_provider'
import { ContributionHistory } from './contribution-history'
import { CoverArt } from './cover-art'
import { DividendIncome } from './dividend-income'
import { Faq } from './faq'
import { IndexInvesting } from './index-investing'
import { KitchenIsland } from './kitchen-island'
import { LoginForm } from './login-form'
import { NotificationSettings } from './notification-settings'
import { PayoutThreshold } from './payout-threshold'
import { Preferences } from './preferences'
import { ReceivingMethod } from './receiving-method'
import { RecentTransactions } from './recent-transactions'
import { ReleaseCatalog } from './release-catalog'
import { SavingsProgress } from './savings-progress'
import { SignupForm } from './signup-form'
import { SocialLinks } from './social-links'

export function BlocksDemo() {
  const ref = useShadcn()
  return (
    <div className="flex min-w-max gap-6">
      <div className="flex w-[360px] flex-col gap-6">
        <ContributionHistory />
        <SavingsProgress />
        <DividendIncome />
      </div>
      <div className="flex w-[360px] flex-col gap-6">
        <IndexInvesting />
        <NotificationSettings />
        <ReceivingMethod />
        <SocialLinks />
      </div>
      <div className="flex w-[360px] flex-col gap-6">
        <LoginForm />
        <Preferences ref={ref} />
        <Faq />
      </div>
      <div className="flex w-[360px] flex-col gap-6">
        <SignupForm />
        <KitchenIsland />
        <PayoutThreshold ref={ref} />
      </div>
      <div className="flex w-[420px] flex-col gap-6">
        <ReleaseCatalog />
        <RecentTransactions ref={ref} />
        <CoverArt />
      </div>
    </div>
  )
}
