import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import BusinessOSWorkspace from './components/BusinessOSWorkspace'
import { CrmProvider } from './context/CrmContext'
import { EmployeeProvider } from './context/EmployeeContext'
import { HrPolicyProvider } from './context/HrPolicyContext'
import { Sun, Moon, KeyRound, Mail, Lock, ArrowLeft, CheckCircle, ShieldCheck, Flame } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  
  // Forces React to wait for Supabase before showing the Login screen
  const [isInitializing, setIsInitializing] = useState(true) 
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [authMode, setAuthMode] = useState('login') // 'login' | 'forgot' | 'reset'
  
  // FIXED: Always start in Light Mode (false) every time the page loads or refreshes!
  const [isDarkMode, setIsDarkMode] = useState(false) 

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsInitializing(false)
      return undefined
    }

    // 1. Get initial session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchRole(session.user.id)
      } else {
        setIsInitializing(false) // Done checking, no user found
      }
    }).catch((err) => {
      console.error("Auth initialization error:", err)
      setIsInitializing(false)
    })

    // 2. Listen for log in / log out / password recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('reset')
        setMessage('Please enter your new password below.')
      } else if (session) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
        setIsInitializing(false)
      }
    })

    // Check URL hash for recovery link
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('reset-password')) {
      setAuthMode('reset')
    }

    return () => subscription.unsubscribe()
  }, [])

  async function fetchRole(userId) {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
    if (error) { console.error(error.message); setRole('guest') }
    else if (data) setRole(data.role)
    else setRole('guest')
    
    setIsInitializing(false) // Finish loading, render the app!
  }

  async function handleSignUp(e) {
    e.preventDefault(); setLoading(true); setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message); else setMessage("Success! Access requested. Contact Admin for approval.")
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (!email || !email.trim()) {
      setMessage("Please enter your email address above to reset your password.")
      return
    }
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/#reset-password`
    })
    if (error) {
      setMessage("Reset Error: " + error.message)
    } else {
      setMessage("Password reset email sent! Please check your inbox for the link.")
    }
    setLoading(false)
  }

  async function handleUpdatePassword(e) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.")
      return
    }
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMessage("Update Error: " + error.message)
    } else {
      setMessage("Password updated successfully! Logging you in...")
      setTimeout(() => {
        setAuthMode('login')
      }, 1500)
    }
    setLoading(false)
  }

  // --- Show Loading screen while checking memory ---
  if (isInitializing) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading your workspace...</div>
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl">
          <h1 className="text-xl font-bold text-sky-400">Supabase configuration required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Add your Supabase project URL and anonymous key to a local <code className="text-sky-300">.env</code> file, then restart the Vite server.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">{`VITE_SUPABASE_URL=your_supabase_project_url\nVITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}</pre>
          <p className="mt-4 text-xs text-slate-500">Use <code>.env.example</code> as the template. Do not commit the local credentials.</p>
        </div>
      </div>
    )
  }

  // --- Only show Login if we are 100% sure there is no session ---
  if (!session && authMode !== 'reset') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Top Right Theme Toggle Bar */}
        <div className="absolute top-5 right-5 z-20">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm flex items-center gap-2 text-xs font-bold ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Main Glass Login Card */}
        <div className={`w-full max-w-md border p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800 text-slate-200' 
            : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}>
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3.5 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0">
              <Flame size={26} className="fill-white/20" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">RAJIV</span>
                <span className="bg-sky-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-widest">CRM</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Fire Fighting & Engineering Project Management
              </p>
            </div>
          </div>

          {authMode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute left-3.5 top-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm border transition ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setMessage(''); }}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-400 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3.5 top-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm border transition ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
                >
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className={`flex-1 border font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Request Access
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-300 font-medium mb-2">
                Enter your registered email address and we will send you instructions to reset your password.
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl p-3 outline-none focus:border-amber-500 text-sm border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                {loading ? 'Sending link...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('login'); setMessage(''); }}
                className={`w-full text-xs font-bold flex items-center justify-center gap-1.5 pt-2 ${
                  isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </form>
          )}

          {message && (
            <div className={`mt-5 p-3.5 rounded-xl text-xs font-semibold text-center border shadow-xs ${
              message.toLowerCase().includes('success') || message.toLowerCase().includes('sent')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SHOW PASSWORD RESET / NEW PASSWORD SCREEN (WHEN RECOVERY TRIGGERED) ---
  if (authMode === 'reset') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Set New Password</h2>
              <p className="text-xs text-slate-400">Enter a secure new password for your account</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 outline-none focus:border-amber-500 text-sm text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition shadow-md"
            >
              {loading ? 'Updating...' : 'Save New Password'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-medium text-center border ${
              message.toLowerCase().includes('success')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <CrmProvider session={session} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onSignOut={() => supabase.auth.signOut()}>
        <EmployeeProvider>
          <HrPolicyProvider>
            <BusinessOSWorkspace />
          </HrPolicyProvider>
        </EmployeeProvider>
      </CrmProvider>
    </div>
  )
}