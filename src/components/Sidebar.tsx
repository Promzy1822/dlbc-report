'use client'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DISTRICTS } from '@/lib/types'

interface SidebarProps {
  userRole: string
  submittedDistricts: string[]
}

export default function Sidebar({ userRole, submittedDistricts }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isAdmin = userRole === 'admin'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const iconEdit = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  )
  const iconChart = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  )
  const iconPrint = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
    </svg>
  )
  const iconLogout = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  )

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="church-name">Deeper Life Bible Church</div>
        <div className="region">Bini Region · Weekly Reports</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>

        {!isAdmin && (
          <a
            className={`nav-link ${pathname === '/entry' ? 'active' : ''}`}
            href="/entry"
          >
            {iconEdit}
            Enter Weekly Data
          </a>
        )}

        {isAdmin && (
          <>
            <a className={`nav-link ${pathname === '/entry' ? 'active' : ''}`} href="/entry">
              {iconEdit}
              Enter Data
            </a>
            <a className={`nav-link ${pathname === '/summary' ? 'active' : ''}`} href="/summary">
              {iconChart}
              Group Summary
            </a>
            <a className={`nav-link ${pathname === '/print' ? 'active' : ''}`} href="/print">
              {iconPrint}
              Print Report
            </a>
          </>
        )}

        {!isAdmin && (
          <a className={`nav-link ${pathname === '/summary' ? 'active' : ''}`} href="/summary">
            {iconChart}
            View Summary
          </a>
        )}

        <div className="nav-section-label" style={{ marginTop: '1rem' }}>Districts</div>
        {DISTRICTS.map(d => {
          const saved = submittedDistricts.includes(d)
          return (
            <div key={d} className="nav-link" style={{ fontSize: '12px' }}>
              <span className={`status-dot ${saved ? 'dot-saved' : 'dot-empty'}`} />
              {d}
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '12px', color: 'var(--gray-400)' }}
        >
          {iconLogout}
          Sign out
        </button>
      </div>
    </div>
  )
}
