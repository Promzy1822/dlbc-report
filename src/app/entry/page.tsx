'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import ToastContainer, { toast } from '@/components/Toast'
import { DISTRICTS, District, WeeklyReport, emptyReport, calcTotals } from '@/lib/types'

function NumField({ label, value, onChange, readOnly }: {
  label: string; value: number; onChange?: (v: number) => void; readOnly?: boolean
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number"
        min={0}
        value={value === 0 && !readOnly ? '' : value}
        readOnly={readOnly}
        placeholder="0"
        onChange={e => onChange?.(parseInt(e.target.value) || 0)}
      />
    </div>
  )
}

export default function EntryPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [userDistrict, setUserDistrict] = useState<District | ''>('')
  const [selectedDistrict, setSelectedDistrict] = useState<District>('OWOSENI')
  const [submittedDistricts, setSubmittedDistricts] = useState<string[]>([])
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
      const district = meta.district || ''
      setUserRole(role)
      setUserDistrict(district)

      const activeDistrict: District = role !== 'admin' ? district : 'OWOSENI'
      setSelectedDistrict(activeDistrict)

      // Load existing report for this district if any
      await loadReport(activeDistrict, supabase)
      setLoading(false)
    }
    load()
  }, [router])

  async function loadReport(district: District, supabaseClient?: ReturnType<typeof createClient>) {
    const supabase = supabaseClient || createClient()
    const thisWeek = report.week_no || ''
    const query = supabase
      .from('weekly_reports')
      .select('*')
      .eq('district', district)
      .order('submitted_at', { ascending: false })
      .limit(1)

    const { data } = await query
    if (data && data.length > 0) {
      setReport(data[0])
    } else {
      setReport(emptyReport(district))
    }

    // Load all submitted districts for sidebar dots
    const { data: all } = await supabase
      .from('weekly_reports')
      .select('district')
      .order('submitted_at', { ascending: false })
    if (all) setSubmittedDistricts(Array.from(new Set(all.map((r: any) => r.district))))
  }

  function setField<K extends keyof WeeklyReport>(key: K, value: WeeklyReport[K]) {
    setReport(r => ({ ...r, [key]: value }))
  }

  async function handleSave() {
    if (!report.week_no) { toast('Please enter the week number', 'error'); return }
    if (!report.report_date) { toast('Please enter the date', 'error'); return }

    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const payload = {
      ...report,
      district: selectedDistrict,
      submitted_by: session?.user?.email,
      submitted_at: new Date().toISOString(),
    }

    // Upsert based on district + week_no
    const { error } = await supabase
      .from('weekly_reports')
      .upsert(payload, { onConflict: 'district,week_no' })

    if (error) {
      toast('Error saving: ' + error.message, 'error')
    } else {
      toast(`${selectedDistrict} district data saved!`)
      setSubmittedDistricts(prev => [...new Set([...prev, selectedDistrict])])
    }
    setSaving(false)
  }

  async function switchDistrict(d: District) {
    setSelectedDistrict(d)
    await loadReport(d)
  }

  const totals = calcTotals(report)
  const isAdmin = userRole === 'admin'

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>

  return (
    <div className="app-layout">
      <Sidebar userRole={userRole} submittedDistricts={submittedDistricts} />
      <div className="main-area">
        <div className="topbar">
          <div>
            <h1>Enter Weekly Data — {selectedDistrict}</h1>
            <p>Fill in attendance numbers for this district</p>
          </div>
          <div className="topbar-actions">
            <button onClick={() => router.push('/dashboard')}>← Dashboard</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Report'}
            </button>
          </div>
        </div>

        <div className="page-content">
          {/* District tabs — admin only */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {DISTRICTS.map(d => (
                <button
                  key={d}
                  onClick={() => switchDistrict(d)}
                  style={{
                    padding: '6px 16px', fontSize: '12px',
                    background: selectedDistrict === d ? 'var(--green)' : 'white',
                    color: selectedDistrict === d ? 'white' : 'var(--gray-600)',
                    borderColor: selectedDistrict === d ? 'var(--green)' : 'var(--border)',
                    fontWeight: selectedDistrict === d ? 600 : 400,
                  }}
                >
                  <span className={`status-dot ${submittedDistricts.includes(d) ? 'dot-saved' : 'dot-empty'}`} style={{ marginRight: '6px' }} />
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* Week/Date meta */}
          <div className="card">
            <div className="card-header"><h3>Report Details</h3></div>
            <div className="card-body">
              <div className="form-row form-row-4">
                <div className="field">
                  <label>Group Name</label>
                  <input value={report.group_name} onChange={e => setField('group_name', e.target.value)} placeholder="e.g. Bini Group" />
                </div>
                <div className="field">
                  <label>Week Number</label>
                  <input value={report.week_no} onChange={e => setField('week_no', e.target.value)} placeholder="e.g. 102" />
                </div>
                <div className="field">
                  <label>Date</label>
                  <input type="date" value={report.report_date} onChange={e => setField('report_date', e.target.value)} />
                </div>
                <div className="field">
                  <label>District</label>
                  <input value={selectedDistrict} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* HCF */}
          <div className="card">
            <div className="card-header">
              <h3>HCF Report</h3>
              <span className="badge badge-green">House Cell Fellowship</span>
            </div>
            <div className="card-body">
              <div className="form-row form-row-3">
                <NumField label="No. of HCF" value={report.hcf_count} onChange={v => setField('hcf_count', v)} />
                <NumField label="No. Present" value={report.hcf_present} onChange={v => setField('hcf_present', v)} />
                <NumField label="New Comers" value={report.hcf_new_comers} onChange={v => setField('hcf_new_comers', v)} />
              </div>
            </div>
          </div>

          {/* Sunday Worship */}
          <div className="card">
            <div className="card-header">
              <h3>Sunday Worship Service</h3>
              <span className="badge badge-green">Sub-total: {totals.worshipSubtotal}</span>
            </div>
            <div className="card-body">
              <div className="sub-heading">Adults</div>
              <div className="form-row form-row-3">
                <NumField label="Men" value={report.worship_adult_men} onChange={v => setField('worship_adult_men', v)} />
                <NumField label="Women" value={report.worship_adult_women} onChange={v => setField('worship_adult_women', v)} />
                <NumField label="Total" value={totals.worshipAdult} readOnly />
              </div>
              <div className="sub-heading">Youths</div>
              <div className="form-row form-row-3">
                <NumField label="Boys" value={report.worship_youth_boys} onChange={v => setField('worship_youth_boys', v)} />
                <NumField label="Girls" value={report.worship_youth_girls} onChange={v => setField('worship_youth_girls', v)} />
                <NumField label="Total" value={totals.worshipYouth} readOnly />
              </div>
              <div className="sub-heading">Children</div>
              <div className="form-row form-row-3">
                <NumField label="Boys" value={report.worship_children_boys} onChange={v => setField('worship_children_boys', v)} />
                <NumField label="Girls" value={report.worship_children_girls} onChange={v => setField('worship_children_girls', v)} />
                <NumField label="Total" value={totals.worshipChildren} readOnly />
              </div>
              <div style={{ marginTop: '1rem', padding: '10px 12px', background: 'var(--green-light)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>Sub-Total (All Attendance)</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)' }}>{totals.worshipSubtotal}</span>
              </div>
            </div>
          </div>

          {/* Bible Study */}
          <div className="card">
            <div className="card-header"><h3>Bible Study</h3></div>
            <div className="card-body">
              <div className="sub-heading">Adults</div>
              <div className="form-row form-row-3">
                <NumField label="Men" value={report.bs_adult_men} onChange={v => setField('bs_adult_men', v)} />
                <NumField label="Women" value={report.bs_adult_women} onChange={v => setField('bs_adult_women', v)} />
                <NumField label="Total" value={totals.bsAdult} readOnly />
              </div>
              <div className="sub-heading">Youths</div>
              <div className="form-row form-row-3">
                <NumField label="Boys" value={report.bs_youth_boys} onChange={v => setField('bs_youth_boys', v)} />
                <NumField label="Girls" value={report.bs_youth_girls} onChange={v => setField('bs_youth_girls', v)} />
                <NumField label="Total" value={totals.bsYouth} readOnly />
              </div>
              <div className="sub-heading">Children</div>
              <div className="form-row form-row-3">
                <NumField label="Boys" value={report.bs_children_boys} onChange={v => setField('bs_children_boys', v)} />
                <NumField label="Girls" value={report.bs_children_girls} onChange={v => setField('bs_children_girls', v)} />
                <NumField label="Total" value={totals.bsChildren} readOnly />
              </div>
            </div>
          </div>

          {/* Revival */}
          <div className="card">
            <div className="card-header"><h3>Revival / Evangelism T.S.</h3></div>
            <div className="card-body">
              <div className="sub-heading">Adults</div>
              <div className="form-row form-row-3">
                <NumField label="Men" value={report.rev_adult_men} onChange={v => setField('rev_adult_men', v)} />
                <NumField label="Women" value={report.rev_adult_women} onChange={v => setField('rev_adult_women', v)} />
                <NumField label="Total" value={totals.revAdult} readOnly />
              </div>
              <div className="sub-heading">Youths</div>
              <div className="form-row form-row-3">
                <NumField label="Boys" value={report.rev_youth_boys} onChange={v => setField('rev_youth_boys', v)} />
                <NumField label="Girls" value={report.rev_youth_girls} onChange={v => setField('rev_youth_girls', v)} />
                <NumField label="Total" value={totals.revYouth} readOnly />
              </div>
              <div className="sub-heading">Children</div>
              <div className="form-row form-row-3">
                <NumField label="Boys" value={report.rev_children_boys} onChange={v => setField('rev_children_boys', v)} />
                <NumField label="Girls" value={report.rev_children_girls} onChange={v => setField('rev_children_girls', v)} />
                <NumField label="Total" value={totals.revChildren} readOnly />
              </div>
            </div>
          </div>

          {/* Offerings */}
          <div className="card">
            <div className="card-header"><h3>Offerings</h3></div>
            <div className="card-body">
              <div className="form-row form-row-2">
                <NumField label="Tithes & Offering (₦)" value={report.tithes_offering} onChange={v => setField('tithes_offering', v)} />
                <NumField label="Special Offering (₦)" value={report.special_offering} onChange={v => setField('special_offering', v)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingBottom: '2rem' }}>
            <button onClick={() => router.push('/dashboard')}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 24px' }}>
              {saving ? 'Saving...' : '✓ Save Report'}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
