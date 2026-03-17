'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import ToastContainer from '@/components/Toast'
import { DISTRICTS, WeeklyReport, calcTotals } from '@/lib/types'

export default function PrintPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [submittedDistricts, setSubmittedDistricts] = useState<string[]>([])
  const [allWeeks, setAllWeeks] = useState<string[]>([])
  const [selectedWeek, setSelectedWeek] = useState('')
  const [groupName, setGroupName] = useState('')
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
        const weeks = [...new Set(data.map((r: WeeklyReport) => r.week_no))] as string[]
        setAllWeeks(weeks)
        const latestWeek = weeks[0]
        setSelectedWeek(latestWeek)
        const latest = data.filter((r: WeeklyReport) => r.week_no === latestWeek)
        setReports(latest)
        setSubmittedDistricts(latest.map((r: WeeklyReport) => r.district))
        if (latest[0]?.group_name) setGroupName(latest[0].group_name)
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
      if (data[0]?.group_name) setGroupName(data[0].group_name)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>

  const v = (r: WeeklyReport | undefined, key: keyof WeeklyReport) => r ? (r[key] as number) || '' : ''

  // Totals row
  const totRow = {
    hcf: reports.reduce((s,r) => s+r.hcf_count,0),
    present: reports.reduce((s,r) => s+r.hcf_present,0),
    newC: reports.reduce((s,r) => s+r.hcf_new_comers,0),
    adM: reports.reduce((s,r) => s+r.worship_adult_men,0),
    adW: reports.reduce((s,r) => s+r.worship_adult_women,0),
    yuB: reports.reduce((s,r) => s+r.worship_youth_boys,0),
    yuG: reports.reduce((s,r) => s+r.worship_youth_girls,0),
    chB: reports.reduce((s,r) => s+r.worship_children_boys,0),
    chG: reports.reduce((s,r) => s+r.worship_children_girls,0),
    bsAdM: reports.reduce((s,r) => s+r.bs_adult_men,0),
    bsAdW: reports.reduce((s,r) => s+r.bs_adult_women,0),
    bsYuB: reports.reduce((s,r) => s+r.bs_youth_boys,0),
    bsYuG: reports.reduce((s,r) => s+r.bs_youth_girls,0),
    bsChB: reports.reduce((s,r) => s+r.bs_children_boys,0),
    bsChG: reports.reduce((s,r) => s+r.bs_children_girls,0),
    rvAdM: reports.reduce((s,r) => s+r.rev_adult_men,0),
    rvAdW: reports.reduce((s,r) => s+r.rev_adult_women,0),
    rvYuB: reports.reduce((s,r) => s+r.rev_youth_boys,0),
    rvYuG: reports.reduce((s,r) => s+r.rev_youth_girls,0),
    rvChB: reports.reduce((s,r) => s+r.rev_children_boys,0),
    rvChG: reports.reduce((s,r) => s+r.rev_children_girls,0),
    tithe: reports.reduce((s,r) => s+r.tithes_offering,0),
    special: reports.reduce((s,r) => s+r.special_offering,0),
  }

  const dateStr = reports[0]?.report_date
    ? new Date(reports[0].report_date + 'T00:00:00').toLocaleDateString('en-GB')
    : '___________'

  const T = (n: number) => n || ''

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submittedDistricts} />
      <div className="main-area">
        <div className="topbar no-print">
          <div>
            <h1>Print Report</h1>
            <p>Preview matches the original template exactly</p>
          </div>
          <div className="topbar-actions">
            <select value={selectedWeek} onChange={e => changeWeek(e.target.value)} style={{ width: 'auto' }}>
              {allWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button onClick={() => router.push('/summary')}>← Summary</button>
            <button className="btn-primary" onClick={() => window.print()}>🖨 Print / Save PDF</button>
          </div>
        </div>

        <div className="page-content">
          <div className="print-wrapper">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deeper Life Bible Church — Bini Region
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                Weekly Summary Reports on Group Basis — Centre & L.G.A
              </div>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
              <div>GROUP: <span style={{ borderBottom: '1px solid #000', minWidth: '80px', display: 'inline-block', paddingBottom: '1px' }}>{groupName}</span></div>
              <div>WEEK No: <span style={{ borderBottom: '1px solid #000', minWidth: '50px', display: 'inline-block', paddingBottom: '1px' }}>{selectedWeek}</span></div>
              <div>DATE: <span style={{ borderBottom: '1px solid #000', minWidth: '100px', display: 'inline-block', paddingBottom: '1px' }}>{dateStr}</span></div>
            </div>

            {/* Main table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="print-table">
                <thead>
                  <tr>
                    <th rowSpan={3} style={{ minWidth: '20px' }}>S/N</th>
                    <th rowSpan={3} style={{ minWidth: '75px', textAlign: 'left' }}>District</th>
                    <th colSpan={3}>HCF Report</th>
                    <th colSpan={12}>Sunday Worship Service</th>
                    <th colSpan={9}>Bible Study</th>
                    <th colSpan={9}>Revival / Evangelism T.S.</th>
                  </tr>
                  <tr>
                    <th rowSpan={2}>HCF</th>
                    <th rowSpan={2}>Pres.</th>
                    <th rowSpan={2}>New</th>
                    <th colSpan={3}>Adult</th>
                    <th colSpan={3}>Youths</th>
                    <th colSpan={3}>Children</th>
                    <th rowSpan={2}>Sub</th>
                    <th colSpan={3}>Adult</th>
                    <th colSpan={3}>Youths</th>
                    <th colSpan={3}>Children</th>
                    <th colSpan={3}>Adults</th>
                    <th colSpan={3}>Youths</th>
                    <th colSpan={3}>Children</th>
                  </tr>
                  <tr>
                    {/* Worship */}
                    <th>M</th><th>W</th><th>T</th>
                    <th>B</th><th>G</th><th>T</th>
                    <th>B</th><th>G</th><th>T</th>
                    {/* BS */}
                    <th>M</th><th>W</th><th>T</th>
                    <th>B</th><th>G</th><th>T</th>
                    <th>B</th><th>G</th><th>T</th>
                    {/* Rev */}
                    <th>M</th><th>W</th><th>T</th>
                    <th>B</th><th>G</th><th>T</th>
                    <th>B</th><th>G</th><th>T</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRICTS.map((d, i) => {
                    const r = reports.find(x => x.district === d)
                    const t = r ? calcTotals(r) : null
                    return (
                      <tr key={d}>
                        <td>{i + 1}</td>
                        <td className="left">{d}</td>
                        <td>{v(r, 'hcf_count')}</td>
                        <td>{v(r, 'hcf_present')}</td>
                        <td>{v(r, 'hcf_new_comers')}</td>
                        <td>{v(r, 'worship_adult_men')}</td>
                        <td>{v(r, 'worship_adult_women')}</td>
                        <td>{t ? T(t.worshipAdult) : ''}</td>
                        <td>{v(r, 'worship_youth_boys')}</td>
                        <td>{v(r, 'worship_youth_girls')}</td>
                        <td>{t ? T(t.worshipYouth) : ''}</td>
                        <td>{v(r, 'worship_children_boys')}</td>
                        <td>{v(r, 'worship_children_girls')}</td>
                        <td>{t ? T(t.worshipChildren) : ''}</td>
                        <td style={{ fontWeight: 700 }}>{t ? T(t.worshipSubtotal) : ''}</td>
                        <td>{v(r, 'bs_adult_men')}</td>
                        <td>{v(r, 'bs_adult_women')}</td>
                        <td>{t ? T(t.bsAdult) : ''}</td>
                        <td>{v(r, 'bs_youth_boys')}</td>
                        <td>{v(r, 'bs_youth_girls')}</td>
                        <td>{t ? T(t.bsYouth) : ''}</td>
                        <td>{v(r, 'bs_children_boys')}</td>
                        <td>{v(r, 'bs_children_girls')}</td>
                        <td>{t ? T(t.bsChildren) : ''}</td>
                        <td>{v(r, 'rev_adult_men')}</td>
                        <td>{v(r, 'rev_adult_women')}</td>
                        <td>{t ? T(t.revAdult) : ''}</td>
                        <td>{v(r, 'rev_youth_boys')}</td>
                        <td>{v(r, 'rev_youth_girls')}</td>
                        <td>{t ? T(t.revYouth) : ''}</td>
                        <td>{v(r, 'rev_children_boys')}</td>
                        <td>{v(r, 'rev_children_girls')}</td>
                        <td>{t ? T(t.revChildren) : ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="left">TOTAL</td>
                    <td>{T(totRow.hcf)}</td><td>{T(totRow.present)}</td><td>{T(totRow.newC)}</td>
                    <td>{T(totRow.adM)}</td><td>{T(totRow.adW)}</td><td>{T(totRow.adM+totRow.adW)}</td>
                    <td>{T(totRow.yuB)}</td><td>{T(totRow.yuG)}</td><td>{T(totRow.yuB+totRow.yuG)}</td>
                    <td>{T(totRow.chB)}</td><td>{T(totRow.chG)}</td><td>{T(totRow.chB+totRow.chG)}</td>
                    <td>{T(totRow.adM+totRow.adW+totRow.yuB+totRow.yuG+totRow.chB+totRow.chG)}</td>
                    <td>{T(totRow.bsAdM)}</td><td>{T(totRow.bsAdW)}</td><td>{T(totRow.bsAdM+totRow.bsAdW)}</td>
                    <td>{T(totRow.bsYuB)}</td><td>{T(totRow.bsYuG)}</td><td>{T(totRow.bsYuB+totRow.bsYuG)}</td>
                    <td>{T(totRow.bsChB)}</td><td>{T(totRow.bsChG)}</td><td>{T(totRow.bsChB+totRow.bsChG)}</td>
                    <td>{T(totRow.rvAdM)}</td><td>{T(totRow.rvAdW)}</td><td>{T(totRow.rvAdM+totRow.rvAdW)}</td>
                    <td>{T(totRow.rvYuB)}</td><td>{T(totRow.rvYuG)}</td><td>{T(totRow.rvYuB+totRow.rvYuG)}</td>
                    <td>{T(totRow.rvChB)}</td><td>{T(totRow.rvChG)}</td><td>{T(totRow.rvChB+totRow.rvChG)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="left">TITHES & OFFERING</td>
                    <td colSpan={29}>₦{totRow.tithe.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="left">SPECIAL OFFERING</td>
                    <td colSpan={29}>₦{totRow.special.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="left">GROUP PASTOR — SIGNATURE & DATE:</td>
                    <td colSpan={29}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--gray-400)' }}>
              M = Men · W = Women · B = Boys · G = Girls · T = Total · Pres. = Present
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
