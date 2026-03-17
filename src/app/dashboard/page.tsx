'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import ToastContainer from '@/components/Toast'
import { DISTRICTS, calcTotals, WeeklyReport } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [userDistrict, setUserDistrict] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [submittedDistricts, setSubmittedDistricts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [weekNo, setWeekNo] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const meta = session.user.user_metadata
      setUserRole(meta.role || '')
      setUserDistrict(meta.district || '')
      setUserEmail(session.user.email || '')

      // Get latest week reports
      const { data } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(50)

      if (data && data.length > 0) {
        setWeekNo(data[0].week_no)
        const latest = data.filter((r: WeeklyReport) => r.week_no === data[0].week_no)
        setReports(latest)
        setSubmittedDistricts(latest.map((r: WeeklyReport) => r.district))
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>

  const isAdmin = userRole === 'admin'
  const totalAttendance = reports.reduce((s, r) => {
    const t = calcTotals(r); return s + t.worshipSubtotal
  }, 0)
  const totalOffering = reports.reduce((s, r) => s + r.tithes_offering + r.special_offering, 0)
  const totalBS = reports.reduce((s, r) => { const t = calcTotals(r); return s + t.bsAdult + t.bsYouth + t.bsChildren }, 0)

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submittedDistricts} />
      <div className="main-area">
        <div className="topbar">
          <div>
            <h1>Welcome{userDistrict ? `, ${userDistrict} District` : ''}</h1>
            <p>{userEmail} · {isAdmin ? 'Group Pastor (Admin)' : 'District Representative'}</p>
          </div>
          <div className="topbar-actions">
            {isAdmin && (
              <>
                <button onClick={() => router.push('/summary')}>View Summary</button>
                <button className="btn-primary" onClick={() => router.push('/print')}>Print Report</button>
              </>
            )}
            {!isAdmin && (
              <button className="btn-primary" onClick={() => router.push('/entry')}>
                Enter This Week's Data →
              </button>
            )}
          </div>
        </div>

        <div className="page-content">
          <div className="stats-grid">
            <div className={`stat-card ${submittedDistricts.length === DISTRICTS.length ? 'accent' : ''}`}>
              <div className="stat-label">Districts submitted</div>
              <div className="stat-value">{submittedDistricts.length}/{DISTRICTS.length}</div>
              <div className="stat-sub">Week {weekNo || '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total worship attendance</div>
              <div className="stat-value">{totalAttendance.toLocaleString()}</div>
              <div className="stat-sub">All districts combined</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Bible study</div>
              <div className="stat-value">{totalBS.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total offerings</div>
              <div className="stat-value">₦{totalOffering.toLocaleString()}</div>
              <div className="stat-sub">Tithes + Special</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>District Submission Status — Week {weekNo || '(no data yet)'}</h3>
              <span className="badge badge-green">{submittedDistricts.length} of {DISTRICTS.length} submitted</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Worship Attendance</th>
                    <th>Bible Study</th>
                    <th>New Comers</th>
                    <th>Offerings</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRICTS.map(d => {
                    const r = reports.find(x => x.district === d)
                    const totals = r ? calcTotals(r) : null
                    return (
                      <tr key={d}>
                        <td style={{ fontWeight: 600 }}>{d}</td>
                        <td>{r ? totals!.worshipSubtotal.toLocaleString() : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? (totals!.bsAdult + totals!.bsYouth + totals!.bsChildren).toLocaleString() : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? r.hcf_new_comers : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? `₦${(r.tithes_offering + r.special_offering).toLocaleString()}` : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>
                          {r
                            ? <span className="badge badge-green">✓ Submitted</span>
                            : <span className="badge badge-gray">Pending</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
