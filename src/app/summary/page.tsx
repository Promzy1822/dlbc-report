'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import ToastContainer from '@/components/Toast'
import { DISTRICTS, WeeklyReport, calcTotals } from '@/lib/types'

export default function SummaryPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [submittedDistricts, setSubmittedDistricts] = useState<string[]>([])
  const [allWeeks, setAllWeeks] = useState<string[]>([])
  const [selectedWeek, setSelectedWeek] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserRole(session.user.user_metadata.role || '')

      const { data } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (data && data.length > 0) {
        const weeks = Array.from(new Set(data.map((r: WeeklyReport) => r.week_no))) as string[]
        setAllWeeks(weeks)
        const latestWeek = weeks[0]
        setSelectedWeek(latestWeek)
        const latest = data.filter((r: WeeklyReport) => r.week_no === latestWeek)
        setReports(latest)
        setSubmittedDistricts(latest.map((r: WeeklyReport) => r.district))
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function changeWeek(week: string) {
    setSelectedWeek(week)
    const supabase = createClient()
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('week_no', week)
    if (data) {
      setReports(data)
      setSubmittedDistricts(data.map((r: WeeklyReport) => r.district))
    }
  }

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>

  const totalAttendance = reports.reduce((s, r) => s + calcTotals(r).worshipSubtotal, 0)
  const totalBS = reports.reduce((s, r) => { const t = calcTotals(r); return s + t.bsAdult + t.bsYouth + t.bsChildren }, 0)
  const totalRev = reports.reduce((s, r) => { const t = calcTotals(r); return s + t.revAdult + t.revYouth + t.revChildren }, 0)
  const totalOffering = reports.reduce((s, r) => s + r.tithes_offering + r.special_offering, 0)
  const totalNewComers = reports.reduce((s, r) => s + r.hcf_new_comers, 0)

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submittedDistricts} />
      <div className="main-area">
        <div className="topbar">
          <div>
            <h1>Group Summary</h1>
            <p>Aggregated weekly data — all districts</p>
          </div>
          <div className="topbar-actions">
            <select value={selectedWeek} onChange={e => changeWeek(e.target.value)} style={{ width: 'auto' }}>
              {allWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button className="btn-primary" onClick={() => router.push('/print')}>Print This Week</button>
          </div>
        </div>

        <div className="page-content">
          <div className="stats-grid">
            <div className="stat-card accent">
              <div className="stat-label">Districts submitted</div>
              <div className="stat-value">{submittedDistricts.length}/{DISTRICTS.length}</div>
              <div className="stat-sub">Week {selectedWeek}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total worship attendance</div>
              <div className="stat-value">{totalAttendance.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">New comers</div>
              <div className="stat-value">{totalNewComers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total offerings</div>
              <div className="stat-value">₦{totalOffering.toLocaleString()}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>District-by-district breakdown — Week {selectedWeek}</h3>
              <button className="btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => router.push('/print')}>Print →</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>District</th>
                    <th>HCF</th>
                    <th>Present</th>
                    <th>New Comers</th>
                    <th>Worship Total</th>
                    <th>Bible Study</th>
                    <th>Revival</th>
                    <th>Tithes & Offering</th>
                    <th>Special Offering</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRICTS.map((d, i) => {
                    const r = reports.find(x => x.district === d)
                    const t = r ? calcTotals(r) : null
                    return (
                      <tr key={d}>
                        <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{d}</td>
                        {r && t ? (
                          <>
                            <td>{r.hcf_count}</td>
                            <td>{r.hcf_present}</td>
                            <td>{r.hcf_new_comers}</td>
                            <td style={{ fontWeight: 600, color: 'var(--green)' }}>{t.worshipSubtotal}</td>
                            <td>{t.bsAdult + t.bsYouth + t.bsChildren}</td>
                            <td>{t.revAdult + t.revYouth + t.revChildren}</td>
                            <td>₦{r.tithes_offering.toLocaleString()}</td>
                            <td>₦{r.special_offering.toLocaleString()}</td>
                            <td><span className="badge badge-green">✓ Submitted</span></td>
                          </>
                        ) : (
                          <td colSpan={10} style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>
                            Not yet submitted
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, background: 'var(--gray-50)' }}>
                    <td colSpan={2} style={{ fontWeight: 700 }}>TOTAL</td>
                    <td>{reports.reduce((s,r) => s+r.hcf_count,0)}</td>
                    <td>{reports.reduce((s,r) => s+r.hcf_present,0)}</td>
                    <td>{totalNewComers}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>{totalAttendance}</td>
                    <td>{totalBS}</td>
                    <td>{totalRev}</td>
                    <td>₦{reports.reduce((s,r) => s+r.tithes_offering,0).toLocaleString()}</td>
                    <td>₦{reports.reduce((s,r) => s+r.special_offering,0).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
