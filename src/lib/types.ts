export const DISTRICTS = [
  'OWOSENI',
  'IHOGBE',
  'IBIWE',
  'OROEGHENE',
  'MERCY',
] as const

export type District = typeof DISTRICTS[number]

export interface WeeklyReport {
  id?: string
  district: District
  week_no: string
  report_date: string
  group_name: string
  hcf_count: number
  hcf_present: number
  hcf_new_comers: number
  worship_adult_men: number
  worship_adult_women: number
  worship_youth_boys: number
  worship_youth_girls: number
  worship_children_boys: number
  worship_children_girls: number
  worship_offering: number
  bs_adult_men: number
  bs_adult_women: number
  bs_youth_boys: number
  bs_youth_girls: number
  bs_children_boys: number
  bs_children_girls: number
  bs_offering: number
  rev_adult_men: number
  rev_adult_women: number
  rev_youth_boys: number
  rev_youth_girls: number
  rev_children_boys: number
  rev_children_girls: number
  rev_offering: number
  special_offering: number
  submitted_at?: string
  submitted_by?: string
}

export function emptyReport(district: District): WeeklyReport {
  return {
    district,
    week_no: '',
    report_date: new Date().toISOString().split('T')[0],
    group_name: '',
    hcf_count: 0, hcf_present: 0, hcf_new_comers: 0,
    worship_adult_men: 0, worship_adult_women: 0,
    worship_youth_boys: 0, worship_youth_girls: 0,
    worship_children_boys: 0, worship_children_girls: 0,
    worship_offering: 0,
    bs_adult_men: 0, bs_adult_women: 0,
    bs_youth_boys: 0, bs_youth_girls: 0,
    bs_children_boys: 0, bs_children_girls: 0,
    bs_offering: 0,
    rev_adult_men: 0, rev_adult_women: 0,
    rev_youth_boys: 0, rev_youth_girls: 0,
    rev_children_boys: 0, rev_children_girls: 0,
    rev_offering: 0,
    special_offering: 0,
  }
}

export function calcTotals(r: WeeklyReport) {
  const worshipAdult = r.worship_adult_men + r.worship_adult_women
  const worshipYouth = r.worship_youth_boys + r.worship_youth_girls
  const worshipChildren = r.worship_children_boys + r.worship_children_girls
  const worshipSubtotal = worshipAdult + worshipYouth + worshipChildren
  const bsAdult = r.bs_adult_men + r.bs_adult_women
  const bsYouth = r.bs_youth_boys + r.bs_youth_girls
  const bsChildren = r.bs_children_boys + r.bs_children_girls
  const bsSubtotal = bsAdult + bsYouth + bsChildren
  const revAdult = r.rev_adult_men + r.rev_adult_women
  const revYouth = r.rev_youth_boys + r.rev_youth_girls
  const revChildren = r.rev_children_boys + r.rev_children_girls
  const revSubtotal = revAdult + revYouth + revChildren
  const totalTithes = r.worship_offering + r.bs_offering + r.rev_offering
  return {
    worshipAdult, worshipYouth, worshipChildren, worshipSubtotal,
    bsAdult, bsYouth, bsChildren, bsSubtotal,
    revAdult, revYouth, revChildren, revSubtotal,
    totalTithes,
    totalOffering: totalTithes + r.special_offering,
  }
    }}
