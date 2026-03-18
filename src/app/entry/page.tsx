'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import ToastContainer, { toast } from '@/components/Toast'
import { DISTRICTS, District, WeeklyReport, emptyReport, calcTotals } from '@/lib/types'

function N({ label, value, onChange, ro }: {
  label: string; value: number; onChange?: (v: number) => void; ro?: boolean
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number" min={0}
        value={value === 0 && !ro ? '' : value}
        readOnly={ro} placeholder="0"
        onChange={e => onChange?.(parseInt(e.target.value) || 0)}
      />
    </div>
  )
}

function OfferingBox({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div style={{
      marginTop: '0.875rem', padding: '10px 14px',
      background: '#FFFBEB', border: '1px solid #FDE68A',
      borderRadius: 'var(--radius)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
    }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', whiteSpace: 'nowrap' }}>
        ₦ {label}
      </span>
      <input
        type="number" min={0}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        style={{
          maxWidth: '160px', textAlign: 'right',
          fontWeight: 700, fontSize: '15px',
          border: '1px solid #FDE68A', borderRadius: 'var(--radius)',
          padding: '6px 10px', background: 'white', color: '#92400E'
        }}
      />
    </div>
  )
}

export default function EntryPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<District>('OWOSENI')
  const [submitted, setSubmitted] = useState<string[]>([])
  const [report, setReport] = useState<WeeklyReport>(emptyReport('OWOSENI'))
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const meta = session.user.user_metadata
      const role = meta.role || ''
      const district = meta.district || 'OWOSENI'
      setUserRole(role)
      const active: District = role !== 'admin' ? district : 'OWOSENI'
      setSelectedDistrict(active)
      await loadReport(active, supabase)
      setLoading(false)
    }
    load()
  }, [router])

  async function loadReport(district: District, client?: ReturnType<typeof createClient>) {
    const supabase = client || createClient()
    const { data } = await supabase
      .from('weekly_reports').select('*')
      .eq('district', district)
      .order('submitted_at', { ascending: false }).limit(1)
    setReport(data && data.length > 0 ? data[0] : emptyReport(district))
    const { data: all } = await supabase.from('weekly_reports').select('district')
    if (all) setSubmitted(Array.from(new Set(all.map((r: WeeklyReport) => r.district))))
  }

  function sf<K extends keyof WeeklyReport>(k: K, v: WeeklyReport[K]) {
    setReport(r => ({ ...r, [k]: v }))
  }

  async function save() {
    if (!report.week_no) { toast('Please enter the week number', 'error'); return }
    if (!report.report_date) { toast('Please enter the date', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('weekly_reports').upsert(
      { ...report, district: selectedDistrict, submitted_by: session?.user?.email, submitted_at: new Date().toISOString() },
      { onConflict: 'district,week_no' }
    )
    if (error) toast('Error: ' + error.message, 'error')
    else {
      toast(`${selectedDistrict} saved successfully!`)
      setSubmitted(prev => Array.from(new Set([...prev, selectedDistrict])))
    }
    setSaving(false)
  }

  const T = calcTotals(report)
  const isAdmin = userRole === 'admin'

  if (loading) return <div className="loader"><div className="spin" />Loading...</div>

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submitted} />
      <div className="main">
        <div className="topbar">
          <Sidebar userRole={userRole} submittedDistricts={submitted} />
          <div className="topbar-title">
            <h1>Enter Data — {selectedDistrict}</h1>
            <p>Fill in attendance and offerings</p>
          </div>
          <div className="topbar-actions">
            <button onClick={() => router.push('/dashboard')}>← Back</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="page">
          {isAdmin && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {DISTRICTS.map(d => (
                <button key={d} onClick={() => { setSelectedDistrict(d); loadReport(d) }}
                  style={{
                    fontSize: '12px', padding: '5px 12px',
                    background: selectedDistrict === d ? 'var(--green)' : 'white',
                    color: selectedDistrict === d ? 'white' : 'var(--gray-600)',
                    borderColor: selectedDistrict === d ? 'var(--green)' : 'var(--border)',
                    fontWeight: selectedDistrict === d ? 700 : 400,
                  }}>
                  <span className={`dot ${submitted.includes(d) ? 'dot-on' : 'dot-off'}`} style={{ marginRight: '5px' }} />
                  {d}
                </button>
              ))}
            </div>
          )}

          <div className="card">
            <div className="card-head"><h3>Report Details</h3></div>
            <div className="card-body">
              <div className="grid-4">
                <div className="field"><label>Group Name</label>
                  <input value={report.group_name} onChange={e => sf('group_name', e.target.value)} placeholder="e.g. Bini Group" />
                </div>
                <div className="field"><label>Week No.</label>
                  <input value={report.week_no} onChange={e => sf('week_no', e.target.value)} placeholder="e.g. 102" />
                </div>
                <div className="field"><label>Date</label>
                  <input type="date" value={report.report_date} onChange={e => sf('report_date', e.target.value)} />
                </div>
                <div className="field"><label>District</label>
                  <input value={selectedDistrict} readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>HCF Report</h3><span className="badge badge-green">House Cell Fellowship</span></div>
            <div className="card-body">
              <div className="grid-3">
                <N label="No. of HCF" value={report.hcf_count} onChange={v => sf('hcf_count', v)} />
                <N label="No. Present" value={report.hcf_present} onChange={v => sf('hcf_present', v)} />
                <N label="New Comers" value={report.hcf_new_comers} onChange={v => sf('hcf_new_comers', v)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Sunday Worship Service</h3><span className="badge badge-green">Sub-total: {T.worshipSubtotal}</span></div>
            <div className="card-body">
              <div className="sub-head">Adults</div>
              <div className="grid-3">
                <N label="Men" value={report.worship_adult_men} onChange={v => sf('worship_adult_men', v)} />
                <N label="Women" value={report.worship_adult_women} onChange={v => sf('worship_adult_women', v)} />
                <N label="Total" value={T.worshipAdult} ro />
              </div>
              <div className="sub-head">Youths</div>
              <div className="grid-3">
                <N label="Boys" value={report.worship_youth_boys} onChange={v => sf('worship_youth_boys', v)} />
                <N label="Girls" value={report.worship_youth_girls} onChange={v => sf('worship_youth_girls', v)} />
                <N label="Total" value={T.worshipYouth} ro />
              </div>
              <div className="sub-head">Children</div>
              <div className="grid-3">
                <N label="Boys" value={report.worship_children_boys} onChange={v => sf('worship_children_boys', v)} />
                <N label="Girls" value={report.worship_children_girls} onChange={v => sf('worship_children_girls', v)} />
                <N label="Total" value={T.worshipChildren} ro />
              </div>
              <div style={{ marginTop: '0.875rem', padding: '10px 14px', background: 'var(--green-light)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>Sub-Total</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green)' }}>{T.worshipSubtotal}</span>
              </div>
              <OfferingBox label="Sunday Worship Offering" value={report.worship_offering} onChange={v => sf('worship_offering', v)} />
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Bible Study</h3><span className="badge badge-green">Sub-total: {T.bsSubtotal}</span></div>
            <div className="card-body">
              <div className="sub-head">Adults</div>
              <div className="grid-3">
                <N label="Men" value={report.bs_adult_men} onChange={v => sf('bs_adult_men', v)} />
                <N label="Women" value={report.bs_adult_women} onChange={v => sf('bs_adult_women', v)} />
                <N label="Total" value={T.bsAdult} ro />
              </div>
              <div className="sub-head">Youths</div>
              <div className="grid-3">
                <N label="Boys" value={report.bs_youth_boys} onChange={v => sf('bs_youth_boys', v)} />
                <N label="Girls" value={report.bs_youth_girls} onChange={v => sf('bs_youth_girls', v)} />
                <N label="Total" value={T.bsYouth} ro />
              </div>
              <div className="sub-head">Children</div>
              <div className="grid-3">
                <N label="Boys" value={report.bs_children_boys} onChange={v => sf('bs_children_boys', v)} />
                <N label="Girls" value={report.bs_children_girls} onChange={v => sf('bs_children_girls', v)} />
                <N label="Total" value={T.bsChildren} ro />
              </div>
              <OfferingBox label="Bible Study Offering" value={report.bs_offering} onChange={v => sf('bs_offering', v)} />
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Revival / Evangelism T.S.</h3><span className="badge badge-green">Sub-total: {T.revSubtotal}</span></div>
            <div className="card-body">
              <div className="sub-head">Adults</div>
              <div className="grid-3">
                <N label="Men" value={report.rev_adult_men} onChange={v => sf('rev_adult_men', v)} />
                <N label="Women" value={report.rev_adult_women} onChange={v => sf('rev_adult_women', v)} />
                <N label="Total" value={T.revAdult} ro />
              </div>
              <div className="sub-head">Youths</div>
              <div className="grid-3">
                <N label="Boys" value={report.rev_youth_boys} onChange={v => sf('rev_youth_boys', v)} />
                <N label="Girls" value={report.rev_youth_girls} onChange={v => sf('rev_youth_girls', v)} />
                <N label="Total" value={T.revYouth} ro />
              </div>
              <div className="sub-head">Children</div>
              <div className="grid-3">
                <N label="Boys" value={report.rev_children_boys} onChange={v => sf('rev_children_boys', v)} />
                <N label="Girls" value={report.rev_children_girls} onChange={v => sf('rev_children_girls', v)} />
                <N label="Total" value={T.revChildren} ro />
              </div>
              <OfferingBox label="Revival / Evangelism Offering" value={report.rev_offering} onChange={v => sf('rev_offering', v)} />
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Special Offering</h3><span className="badge badge-gray">One-time</span></div>
            <div className="card-body">
              <div className="grid-2">
                <div className="field">
                  <label>Special Offering (₦)</label>
                  <input type="number" min={0}
                    value={report.special_offering === 0 ? '' : report.special_offering}
                    placeholder="0"
                    onChange={e => sf('special_offering', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 }}>TOTAL OFFERINGS THIS WEEK</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>₦{T.totalOffering.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Sunday + Bible Study + Revival + Special</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingBottom: '2rem' }}>
            <button onClick={() => router.push('/dashboard')}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving} style={{ padding: '10px 28px', fontSize: '14px' }}>
              {saving ? 'Saving…' : '✓ Save Report'}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
                                                                 }
