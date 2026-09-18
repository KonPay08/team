import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouter } from '@tanstack/react-router'
import appCss from '~/styles/app.css?url'
import { getTeam, resetTeam, signOut } from '~/server/functions'
import { roleLabel } from '~/features/team/types'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'チーム出欠' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  loader: () => getTeam(),
  component: RootComponent,
})

function RootComponent() {
  const { teamName, currentUser } = Route.useLoaderData()
  const router = useRouter()

  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link to="/" className="text-base font-bold">
              {teamName}
            </Link>
            <div className="flex items-center gap-3 text-sm">
              {currentUser ? (
                <>
                  <span className="text-slate-600">
                    {currentUser.name}
                    <span className="ml-1 text-xs text-slate-400">
                      {roleLabel[currentUser.role]}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="text-slate-500 underline"
                    onClick={async () => {
                      await signOut()
                      await router.invalidate()
                      router.navigate({ to: '/setup' })
                    }}
                  >
                    切替
                  </button>
                </>
              ) : (
                <Link to="/setup" className="text-slate-500 underline">
                  初期設定
                </Link>
              )}
              <button
                type="button"
                className="text-xs text-slate-400 underline"
                onClick={async () => {
                  await resetTeam()
                  await router.invalidate()
                  router.navigate({ to: '/setup' })
                }}
              >
                デモを初期化
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  )
}
