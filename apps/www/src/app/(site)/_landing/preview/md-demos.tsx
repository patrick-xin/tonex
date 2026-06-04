import {
  ContributionHistory,
  DividendIncome,
  Faq,
  IndexInvesting,
  KitchenIsland,
  LoginForm,
  NotificationSettings,
  Preferences,
  ReceivingMethod,
  RecentTransactions,
  ReleaseCatalog,
  SavingsProgress,
} from '../../../(app)/theme/(md)/blocks/_components'

export default function MdDemos() {
  return (
    <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain mask-[linear-gradient(to_bottom,black_80%,transparent)] min-w-0  gap-12">
      <div className="m-px flex min-w-max gap-4">
        <div className="flex w-90 flex-col gap-4">
          <KitchenIsland />
          <IndexInvesting />
          <NotificationSettings />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <LoginForm />
          <Preferences />
          <Faq />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <SavingsProgress />
          <ReceivingMethod />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <ContributionHistory />
          <DividendIncome />
        </div>
        <div className="flex w-105 flex-col gap-4">
          <ReleaseCatalog />
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
