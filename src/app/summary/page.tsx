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
  const [submitted, setSubmitted] = useState<string[]>([])
  const [allWeeks, setAllWeeks] = useState<string[]>([])
  const [week, setWeek] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserRole(session.user.user_metadata.role || '')
      const { data } = await supabase
        .from('weekly_reports').select('*')
        .order('submitted_at', { ascending: false })
      if (data && data.length > 0) {
        const weeks = Array.from(new Set(data.map((r: WeeklyReport) => r.week_no))) as string[]
        setAllWeeks(weeks)
        setWeek(weeks[0])
        const latest = data.filter((r: WeeklyReport) => r.week_no === weeks[0])
        setReports(latest)
        setSubmitted(latest.map((r: WeeklyReport) => r.district))
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function changeWeek(w: string) {
    setWeek(w)
    const supabase = createClient()
    const { data } = await supabase
      .from('weekly_reports').select('*').eq('week_no', w)
    if (data) {
      setReports(data)
      setSubmitted(data.map((r: WeeklyReport) => r.district))
    }
  }

  if (loading) return <div className="loader"><div className="spin" />Loading...</div>

  const totalAtt = reports.reduce((s, r) => s + calcTotals(r).worshipSubtotal, 0)
  const totalBS = reports.reduce((s, r) => { const t = calcTotals(r); return s + t.bsAdult + t.bsYouth + t.bsChildren }, 0)
  const totalRev = reports.reduce((s, r) => { const t = calcTotals(r); return s + t.revAdult + t.revYouth + t.revChildren }, 0)
  const totalNew = reports.reduce((s, r) => s + r.hcf_new_comers, 0)
  const totalWorshipOff = reports.reduce((s, r) => s + r.worship_offering, 0)
  const totalBsOff = reports.reduce((s, r) => s + r.bs_offering, 0)
  const totalRevOff = reports.reduce((s, r) => s + r.rev_offering, 0)
  const totalSpecial = reports.reduce((s, r) => s + r.special_offering, 0)
  const totalTithes = totalWorshipOff + totalBsOff + totalRevOff

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submitted} />
      <div className="main">
        <div className="topbar">
          <Sidebar userRole={userRole} submittedDistricts={submitted} />
          <div className="topbar-title">
            <h1>Group Summary</h1>
            <p>All districts — aggregated view</p>
          </div>
          <div className="topbar-actions">
            <select value={week} onChange={e => changeWeek(e.target.value)}
              style={{ width: 'auto', fontSize: '13px', padding: '6px 10px' }}>
              {allWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button className="btn-primary" onClick={() => router.push('/print')}>Print</button>
          </div>
        </div>

        <div className="page">
          <div className="stats">
            <div className={`stat ${submitted.length === DISTRICTS.length ? 'hi' : ''}`}>
              <div className="stat-label">Submitted</div>
              <div className="stat-val">{submitted.length}/{DISTRICTS.length}</div>
              <div className="stat-sub">Week {week}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Worship attendance</div>
              <div className="stat-val">{totalAtt.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-label">New comers</div>
              <div className="stat-val">{totalNew}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total tithes</div>
              <div className="stat-val">₦{totalTithes.toLocaleString()}</div>
              <div className="stat-sub">All activities</div>
            </div>
          </div>

          {/* Offerings breakdown card */}
          <div className="card">
            <div className="card-head"><h3>Offerings Breakdown — Week {week}</h3></div>
            <div className="card-body">
              <div className="grid-4">
                <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FFFBEB', borderRadius: 'var(--radius)', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Sunday Worship</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#92400E' }}>₦{totalWorshipOff.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FFFBEB', borderRadius: 'var(--radius)', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Bible Study</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#92400E' }}>₦{totalBsOff.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FFFBEB', borderRadius: 'var(--radius)', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Revival</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#92400E' }}>₦{totalRevOff.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--green-light)', borderRadius: 'var(--radius)', border: '1px solid var(--green)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>Special Offering</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>₦{totalSpecial.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>District breakdown — Week {week}</h3>
              <button className="btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => router.push('/print')}>Print →</button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>#</th><th>District</th><th>Worship</th>
                    <th>Bible Study</th><th>Revival</th><th>New</th>
                    <th>Sunday Off.</th><th>BS Off.</th>
                    <th>Revival Off.</th><th>Special Off.</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRICTS.map((d, i) => {
                    const r = reports.find(x => x.district === d)
                    const t = r ? calcTotals(r) : null
                    return (
                      <tr key={d}>
                        <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{d}</td>
                        {r && t ? <>
                          <td style={{ fontWeight: 700, color: 'var(--green)' }}>{t.worshipSubtotal}</td>
                          <td>{t.bsAdult + t.bsYouth + t.bsChildren}</td>
                          <td>{t.revAdult + t.revYouth + t.revChildren}</td>
                          <td>{r.hcf_new_comers}</td>
                          <td>₦{r.worship_offering.toLocaleString()}</td>
                          <td>₦{r.bs_offering.toLocaleString()}</td>
                          <td>₦{r.rev_offering.toLocaleString()}</td>
                          <td>₦{r.special_offering.toLocaleString()}</td>
                          <td><span className="badge badge-green">✓ Done</span></td>
                        </> : (
                          <td colSpan={10} style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Not submitted</td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>TOTAL</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>{totalAtt}</td>
                    <td>{totalBS}</td>
                    <td>{totalRev}</td>
                    <td>{totalNew}</td>
                    <td>₦{totalWorshipOff.toLocaleString()}</td>
                    <td>₦{totalBsOff.toLocaleString()}</td>
                    <td>₦{totalRevOff.toLocaleString()}</td>
                    <td>₦{totalSpecial.toLocaleString()}</td>
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
