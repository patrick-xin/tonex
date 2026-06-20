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
} from './index'

export function BlocksDemo() {
  return (
    <div className="flex flex-col sm:flex-row sm:min-w-max gap-6 m-px">
      <div className="flex sm:w-90 flex-col gap-6">
        <ContributionHistory />
        <SavingsProgress />
        <DividendIncome />
      </div>
      <div className="hidden sm:flex sm:w-90 flex-col gap-6">
        <IndexInvesting />
        <NotificationSettings />
        <ReceivingMethod />
        <SocialLinks />
      </div>
      <div className="flex sm:w-90 flex-col gap-6">
        <LoginForm />
        <Preferences />
        <Faq />
      </div>
      <div className="hidden sm:flex sm:w-90 flex-col gap-6">
        <SignupForm />
        <KitchenIsland />
        <PayoutThreshold />
      </div>
      <div className="flex sm:w-105 flex-col gap-6">
        <ReleaseCatalog />
        <RecentTransactions />
        <CoverArt />
      </div>
      <div className="hidden sm:block">
        <ProjectQuoteForm />
      </div>
    </div>
  )
}
