import { useAuth } from '../auth/useAuth'

export default function PrivateHomeRoute() {
  const { token, logout } = useAuth()

  return (
    <main className='min-h-screen bg-slate-50 p-6'>
      <section className='mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-semibold text-slate-900'>Espace prive</h1>
        <p className='mt-2 text-slate-700'>Tu es connectee. Cette page est protegee.</p>

        <div className='mt-4 rounded-md bg-slate-100 p-3'>
          <p className='text-sm text-slate-600'>Token JWT stocke localement:</p>
          <p className='mt-1 break-all text-xs text-slate-800'>{token}</p>
        </div>

        <button
          type='button'
          onClick={logout}
          className='mt-6 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700'
        >
          Se deconnecter
        </button>
      </section>
    </main>
  )
}
