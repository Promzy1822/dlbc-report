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
  const [submitted, setSubmitted] = useState<string[]>([])
  const [allWeeks, setAllWeeks] = useState<string[]>([])
  const [week, setWeek] = useState('')
  const [groupName, setGroupName] = useState('')
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
        if (latest[0]?.group_name) setGroupName(latest[0].group_name)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function changeWeek(w: string) {
    setWeek(w)
    const supabase = createClient()
    const { data } = await supabase.from('weekly_reports').select('*').eq('week_no', w)
    if (data) {
      setReports(data)
      setSubmitted(data.map((r: WeeklyReport) => r.district))
      if (data[0]?.group_name) setGroupName(data[0].group_name)
    }
  }

  if (loading) return <div className="loader"><div className="spin" />Loading...</div>

  const v = (r: WeeklyReport | undefined, k: keyof WeeklyReport) =>
    r ? (r[k] as number) || '' : ''
  const Z = (n: number) => n || ''

  const tot = {
    hcf:    reports.reduce((s,r)=>s+r.hcf_count,0),
    pres:   reports.reduce((s,r)=>s+r.hcf_present,0),
    newC:   reports.reduce((s,r)=>s+r.hcf_new_comers,0),
    adM:    reports.reduce((s,r)=>s+r.worship_adult_men,0),
    adW:    reports.reduce((s,r)=>s+r.worship_adult_women,0),
    yuB:    reports.reduce((s,r)=>s+r.worship_youth_boys,0),
    yuG:    reports.reduce((s,r)=>s+r.worship_youth_girls,0),
    chB:    reports.reduce((s,r)=>s+r.worship_children_boys,0),
    chG:    reports.reduce((s,r)=>s+r.worship_children_girls,0),
    bsAM:   reports.reduce((s,r)=>s+r.bs_adult_men,0),
    bsAW:   reports.reduce((s,r)=>s+r.bs_adult_women,0),
    bsYB:   reports.reduce((s,r)=>s+r.bs_youth_boys,0),
    bsYG:   reports.reduce((s,r)=>s+r.bs_youth_girls,0),
    bsCB:   reports.reduce((s,r)=>s+r.bs_children_boys,0),
    bsCG:   reports.reduce((s,r)=>s+r.bs_children_girls,0),
    rvAM:   reports.reduce((s,r)=>s+r.rev_adult_men,0),
    rvAW:   reports.reduce((s,r)=>s+r.rev_adult_women,0),
    rvYB:   reports.reduce((s,r)=>s+r.rev_youth_boys,0),
    rvYG:   reports.reduce((s,r)=>s+r.rev_youth_girls,0),
    rvCB:   reports.reduce((s,r)=>s+r.rev_children_boys,0),
    rvCG:   reports.reduce((s,r)=>s+r.rev_children_girls,0),
    worshipOff: reports.reduce((s,r)=>s+r.worship_offering,0),
    bsOff:      reports.reduce((s,r)=>s+r.bs_offering,0),
    revOff:     reports.reduce((s,r)=>s+r.rev_offering,0),
    specialOff: reports.reduce((s,r)=>s+r.special_offering,0),
  }

  const totalTithes = tot.worshipOff + tot.bsOff + tot.revOff
  const dateStr = reports[0]?.report_date
    ? new Date(reports[0].report_date + 'T00:00:00').toLocaleDateString('en-GB')
    : '___________'

  const th: React.CSSProperties = {
    border: '1px solid #000', padding: '2px', textAlign: 'center',
    background: '#f0f0f0', fontWeight: 700, fontSize: '7.5px', lineHeight: 1.2,
  }
  const td: React.CSSProperties = {
    border: '1px solid #000', padding: '2px',
    textAlign: 'center', fontSize: '8px', lineHeight: 1.3,
  }
  const tdL: React.CSSProperties = { ...td, textAlign: 'left', fontWeight: 600, paddingLeft: '3px' }
  const tdB: React.CSSProperties = { ...td, fontWeight: 700, background: '#f8f8f8' }
  const tfTd: React.CSSProperties = { ...td, fontWeight: 700, background: '#f0f0f0' }

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submitted} />
      <div className="main">

        <div className="topbar no-print">
          <Sidebar userRole={userRole} submittedDistricts={submitted} />
          <div className="topbar-title">
            <h1>Print Report</h1>
            <p>Always prints like the original paper form</p>
          </div>
          <div className="topbar-actions">
            <select value={week} onChange={e => changeWeek(e.target.value)}
              style={{ width: 'auto', fontSize: '13px', padding: '6px 10px' }}>
              {allWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button onClick={() => router.push('/summary')}>← Back</button>
            <button className="btn-primary" onClick={() => window.print()}>🖨 Print / Save PDF</button>
          </div>
        </div>

        <div className="page">
          <div style={{
            background: 'white', padding: '12px',
            border: '1px solid #ccc', borderRadius: '8px',
            minWidth: '900px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deeper Life Bible Church — Bini Region
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                Weekly Summary Reports on Group Basis — Centre &amp; L.G.A
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '8px', fontSize: '10px', fontFamily: 'Arial, sans-serif' }}>
              <div>GROUP: <span style={{ borderBottom: '1px solid #000', minWidth: '80px', display: 'inline-block' }}>{groupName}</span></div>
              <div>WEEK No: <span style={{ borderBottom: '1px solid #000', minWidth: '40px', display: 'inline-block' }}>{week}</span></div>
              <div>DATE: <span style={{ borderBottom: '1px solid #000', minWidth: '100px', display: 'inline-block' }}>{dateStr}</span></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', fontFamily: 'Arial, sans-serif', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '18px' }} />
                <col style={{ width: '58px' }} />
                <col style={{ width: '18px' }} />
                <col style={{ width: '20px' }} />
                <col style={{ width: '18px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '18px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
                <col style={{ width: '14px' }} /><col style={{ width: '14px' }} /><col style={{ width: '16px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={th} rowSpan={3}>S/N</th>
                  <th style={th} rowSpan={3}>District</th>
                  <th style={th} colSpan={3}>HCF Report</th>
                  <th style={th} colSpan={12}>Sunday Worship Service</th>
                  <th style={th} colSpan={9}>Bible Study</th>
                  <th style={th} colSpan={9}>Revival / Evangelism T.S.</th>
                </tr>
                <tr>
                  <th style={th} rowSpan={2}>HCF</th>
                  <th style={th} rowSpan={2}>Pres.</th>
                  <th style={th} rowSpan={2}>New</th>
                  <th style={th} colSpan={3}>Adult</th>
                  <th style={th} colSpan={3}>Youths</th>
                  <th style={th} colSpan={3}>Children</th>
                  <th style={th} rowSpan={2}>Sub</th>
                  <th style={th} colSpan={3}>Adult</th>
                  <th style={th} colSpan={3}>Youths</th>
                  <th style={th} colSpan={3}>Children</th>
                  <th style={th} colSpan={3}>Adults</th>
                  <th style={th} colSpan={3}>Youths</th>
                  <th style={th} colSpan={3}>Children</th>
                </tr>
                <tr>
                  <th style={th}>M</th><th style={th}>W</th><th style={th}>T</th>
                  <th style={th}>B</th><th style={th}>G</th><th style={th}>T</th>
                  <th style={th}>B</th><th style={th}>G</th><th style={th}>T</th>
                  <th style={th}>M</th><th style={th}>W</th><th style={th}>T</th>
                  <th style={th}>B</th><th style={th}>G</th><th style={th}>T</th>
                  <th style={th}>B</th><th style={th}>G</th><th style={th}>T</th>
                  <th style={th}>M</th><th style={th}>W</th><th style={th}>T</th>
                  <th style={th}>B</th><th style={th}>G</th><th style={th}>T</th>
                  <th style={th}>B</th><th style={th}>G</th><th style={th}>T</th>
                </tr>
              </thead>
              <tbody>
                {DISTRICTS.map((d, i) => {
                  const r = reports.find(x => x.district === d)
                  const t = r ? calcTotals(r) : null
                  return (
                    <tr key={d} style={{ height: '18px' }}>
                      <td style={td}>{i+1}</td>
                      <td style={tdL}>{d}</td>
                      <td style={td}>{v(r,'hcf_count')}</td>
                      <td style={td}>{v(r,'hcf_present')}</td>
                      <td style={td}>{v(r,'hcf_new_comers')}</td>
                      <td style={td}>{v(r,'worship_adult_men')}</td>
                      <td style={td}>{v(r,'worship_adult_women')}</td>
                      <td style={tdB}>{t ? Z(t.worshipAdult) : ''}</td>
                      <td style={td}>{v(r,'worship_youth_boys')}</td>
                      <td style={td}>{v(r,'worship_youth_girls')}</td>
                      <td style={tdB}>{t ? Z(t.worshipYouth) : ''}</td>
                      <td style={td}>{v(r,'worship_children_boys')}</td>
                      <td style={td}>{v(r,'worship_children_girls')}</td>
                      <td style={tdB}>{t ? Z(t.worshipChildren) : ''}</td>
                      <td style={{...tdB, fontWeight:800}}>{t ? Z(t.worshipSubtotal) : ''}</td>
                      <td style={td}>{v(r,'bs_adult_men')}</td>
                      <td style={td}>{v(r,'bs_adult_women')}</td>
                      <td style={tdB}>{t ? Z(t.bsAdult) : ''}</td>
                      <td style={td}>{v(r,'bs_youth_boys')}</td>
                      <td style={td}>{v(r,'bs_youth_girls')}</td>
                      <td style={tdB}>{t ? Z(t.bsYouth) : ''}</td>
                      <td style={td}>{v(r,'bs_children_boys')}</td>
                      <td style={td}>{v(r,'bs_children_girls')}</td>
                      <td style={tdB}>{t ? Z(t.bsChildren) : ''}</td>
                      <td style={td}>{v(r,'rev_adult_men')}</td>
                      <td style={td}>{v(r,'rev_adult_women')}</td>
                      <td style={tdB}>{t ? Z(t.revAdult) : ''}</td>
                      <td style={td}>{v(r,'rev_youth_boys')}</td>
                      <td style={td}>{v(r,'rev_youth_girls')}</td>
                      <td style={tdB}>{t ? Z(t.revYouth) : ''}</td>
                      <td style={td}>{v(r,'rev_children_boys')}</td>
                      <td style={td}>{v(r,'rev_children_girls')}</td>
                      <td style={tdB}>{t ? Z(t.revChildren) : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={tfTd} colSpan={2}>TOTAL</td>
                  <td style={tfTd}>{Z(tot.hcf)}</td>
                  <td style={tfTd}>{Z(tot.pres)}</td>
                  <td style={tfTd}>{Z(tot.newC)}</td>
                  <td style={tfTd}>{Z(tot.adM)}</td><td style={tfTd}>{Z(tot.adW)}</td><td style={tfTd}>{Z(tot.adM+tot.adW)}</td>
                  <td style={tfTd}>{Z(tot.yuB)}</td><td style={tfTd}>{Z(tot.yuG)}</td><td style={tfTd}>{Z(tot.yuB+tot.yuG)}</td>
                  <td style={tfTd}>{Z(tot.chB)}</td><td style={tfTd}>{Z(tot.chG)}</td><td style={tfTd}>{Z(tot.chB+tot.chG)}</td>
                  <td style={tfTd}>{Z(tot.adM+tot.adW+tot.yuB+tot.yuG+tot.chB+tot.chG)}</td>
                  <td style={tfTd}>{Z(tot.bsAM)}</td><td style={tfTd}>{Z(tot.bsAW)}</td><td style={tfTd}>{Z(tot.bsAM+tot.bsAW)}</td>
                  <td style={tfTd}>{Z(tot.bsYB)}</td><td style={tfTd}>{Z(tot.bsYG)}</td><td style={tfTd}>{Z(tot.bsYB+tot.bsYG)}</td>
                  <td style={tfTd}>{Z(tot.bsCB)}</td><td style={tfTd}>{Z(tot.bsCG)}</td><td style={tfTd}>{Z(tot.bsCB+tot.bsCG)}</td>
                  <td style={tfTd}>{Z(tot.rvAM)}</td><td style={tfTd}>{Z(tot.rvAW)}</td><td style={tfTd}>{Z(tot.rvAM+tot.rvAW)}</td>
                  <td style={tfTd}>{Z(tot.rvYB)}</td><td style={tfTd}>{Z(tot.rvYG)}</td><td style={tfTd}>{Z(tot.rvYB+tot.rvYG)}</td>
                  <td style={tfTd}>{Z(tot.rvCB)}</td><td style={tfTd}>{Z(tot.rvCG)}</td><td style={tfTd}>{Z(tot.rvCB+tot.rvCG)}</td>
                </tr>
                <tr>
                  <td style={{...tfTd, textAlign:'left'}} colSpan={5}>TITHES &amp; OFFERING</td>
                  <td style={{...tfTd, textAlign:'left'}} colSpan={10}>
                    Sunday: ₦{tot.worshipOff.toLocaleString()} &nbsp;|&nbsp;
                    Bible Study: ₦{tot.bsOff.toLocaleString()} &nbsp;|&nbsp;
                    Revival: ₦{tot.revOff.toLocaleString()} &nbsp;|&nbsp;
                    <strong>Total: ₦{totalTithes.toLocaleString()}</strong>
                  </td>
                  <td style={tfTd} colSpan={19}></td>
                </tr>
                <tr>
                  <td style={{...tfTd, textAlign:'left'}} colSpan={5}>SPECIAL OFFERING</td>
                  <td style={{...tfTd, textAlign:'left'}} colSpan={10}>₦{tot.specialOff.toLocaleString()}</td>
                  <td style={tfTd} colSpan={19}></td>
                </tr>
                <tr>
                  <td style={{...td, textAlign:'left'}} colSpan={5}>GROUP PASTOR — SIGNATURE &amp; DATE:</td>
                  <td style={td} colSpan={29}></td>
                </tr>
              </tfoot>
            </table>

            <div style={{ marginTop: '6px', fontSize: '9px', color: '#666', fontFamily: 'Arial, sans-serif' }}>
              M = Men · W = Women · B = Boys · G = Girls · T = Total · Pres. = Present · Sub = Sub-Total
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
