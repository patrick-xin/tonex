import type { Metadata } from 'next'
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
  ProjectQuoteForm,
  ReceivingMethod,
  RecentTransactions,
  ReleaseCatalog,
  SavingsProgress,
  SignupForm,
  SocialLinks,
} from './_components'

export const metadata: Metadata = {
  title: 'Blocks',
  description: 'Component blocks',
}

export default function BlocksPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ContributionHistory />
        <PayoutThreshold />
        <Preferences />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SavingsProgress />
        <DividendIncome />
        <IndexInvesting />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <NotificationSettings />
        <ReceivingMethod />
        <SocialLinks />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <LoginForm />
        <SignupForm />
        <KitchenIsland />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <RecentTransactions className="lg:col-span-2" />
        <CoverArt />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ReleaseCatalog className="lg:col-span-2" />
        <Faq />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectQuoteForm />
      </div>
    </div>
  )
}
