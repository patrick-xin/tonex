import {
  ContributionHistory,
  IndexInvesting,
  KitchenIsland,
  LoginForm,
  NotificationSettings,
  Preferences,
  RecentTransactions,
  ReleaseCatalog,
  SavingsProgress,
  SignupForm,
} from '../../../(app)/theme/(shadcn)/shadcn/blocks/_components'

export default function ShadcnDemos() {
  return (
    <div className="gap-12">
      <div className="m-px flex min-w-max gap-4">
        <div className="flex w-90 flex-col gap-4">
          <SavingsProgress />
          <ReleaseCatalog />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <IndexInvesting />
          <NotificationSettings />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <LoginForm />
          <Preferences />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <SignupForm />
          <KitchenIsland />
        </div>
        <div className="flex w-90 flex-col gap-4">
          <ContributionHistory />
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
