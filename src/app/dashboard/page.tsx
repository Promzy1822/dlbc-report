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
  const [submitted, setSubmitted] = useState<string[]>([])
  const [weekNo, setWeekNo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const meta = session.user.user_metadata
      setUserRole(meta.role || '')
      setUserDistrict(meta.district || '')
      setUserEmail(session.user.email || '')
      const { data } = await supabase
        .from('weekly_reports').select('*')
        .order('submitted_at', { ascending: false }).limit(50)
      if (data && data.length > 0) {
        setWeekNo(data[0].week_no)
        const latest = data.filter((r: WeeklyReport) => r.week_no === data[0].week_no)
        setReports(latest)
        setSubmitted(latest.map((r: WeeklyReport) => r.district))
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="loader"><div className="spin" />Loading...</div>

  const isAdmin = userRole === 'admin'
  const totalAtt = reports.reduce((s, r) => s + calcTotals(r).worshipSubtotal, 0)
  const totalTithes = reports.reduce((s, r) => s + r.worship_offering + r.bs_offering + r.rev_offering, 0)
  const totalSpecial = reports.reduce((s, r) => s + r.special_offering, 0)
  const totalNew = reports.reduce((s, r) => s + r.hcf_new_comers, 0)

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submitted} />
      <div className="main">
        <div className="topbar">
          <Sidebar userRole={userRole} submittedDistricts={submitted} />
          <div className="topbar-title">
            <h1>Welcome{userDistrict ? `, ${userDistrict}` : ''}</h1>
            <p>{userEmail} · {isAdmin ? 'Group Pastor' : 'District Rep'}</p>
          </div>
          <div className="topbar-actions">
            {isAdmin && <>
              <button onClick={() => router.push('/summary')}>Summary</button>
              <button className="btn-primary" onClick={() => router.push('/print')}>Print</button>
            </>}
            {!isAdmin && (
              <button className="btn-primary" onClick={() => router.push('/entry')}>
                Enter Data →
              </button>
            )}
          </div>
        </div>

        <div className="page">
          <div className="stats">
            <div className={`stat ${submitted.length === DISTRICTS.length ? 'hi' : ''}`}>
              <div className="stat-label">Districts submitted</div>
              <div className="stat-val">{submitted.length}/{DISTRICTS.length}</div>
              <div className="stat-sub">Week {weekNo || '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Worship attendance</div>
              <div className="stat-val">{totalAtt.toLocaleString()}</div>
              <div className="stat-sub">All districts</div>
            </div>
            <div className="stat">
              <div className="stat-label">New comers</div>
              <div className="stat-val">{totalNew}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total tithes</div>
              <div className="stat-val">₦{totalTithes.toLocaleString()}</div>
              <div className="stat-sub">Special: ₦{totalSpecial.toLocaleString()}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>District Status — Week {weekNo || '(no data yet)'}</h3>
              <span className="badge badge-green">{submitted.length} of {DISTRICTS.length} submitted</span>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Worship</th>
                    <th>Bible Study</th>
                    <th>Revival</th>
                    <th>New Comers</th>
                    <th>Tithes & Offering</th>
                    <th>Special</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRICTS.map(d => {
                    const r = reports.find(x => x.district === d)
                    const t = r ? calcTotals(r) : null
                    return (
                      <tr key={d}>
                        <td style={{ fontWeight: 700 }}>{d}</td>
                        <td>{r ? t!.worshipSubtotal.toLocaleString() : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? (t!.bsAdult + t!.bsYouth + t!.bsChildren) : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? (t!.revAdult + t!.revYouth + t!.revChildren) : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? r.hcf_new_comers : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? `₦${(r.worship_offering + r.bs_offering + r.rev_offering).toLocaleString()}` : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? `₦${r.special_offering.toLocaleString()}` : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                        <td>{r ? <span className="badge badge-green">✓ Submitted</span> : <span className="badge badge-gray">Pending</span>}</td>
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
