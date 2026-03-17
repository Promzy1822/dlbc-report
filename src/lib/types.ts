export const DISTRICTS = [
  'OWOSENI',
  'IHOGBE',
  'IBIWE',
  'OROEGHENE',
  'MERCY',
] as const

export type District = typeof DISTRICTS[number]

export const DISTRICT_ROLES: Record<District, string> = {
  OWOSENI: 'district_owoseni',
  IHOGBE: 'district_ihogbe',
  IBIWE: 'district_ibiwe',
  OROEGHENE: 'district_oroeghene',
  MERCY: 'district_mercy',
}

export interface WeeklyReport {
  id?: string
  district: District
  week_no: string
  report_date: string
  group_name: string

  // HCF
  hcf_count: number
  hcf_present: number
  hcf_new_comers: number

  // Sunday Worship - Adults
  worship_adult_men: number
  worship_adult_women: number

  // Sunday Worship - Youths
  worship_youth_boys: number
  worship_youth_girls: number

  // Sunday Worship - Children
  worship_children_boys: number
  worship_children_girls: number

  // Bible Study - Adults
  bs_adult_men: number
  bs_adult_women: number

  // Bible Study - Youths
  bs_youth_boys: number
  bs_youth_girls: number

  // Bible Study - Children
  bs_children_boys: number
  bs_children_girls: number

  // Revival/Evangelism - Adults
  rev_adult_men: number
  rev_adult_women: number

  // Revival/Evangelism - Youths
  rev_youth_boys: number
  rev_youth_girls: number

  // Revival/Evangelism - Children
  rev_children_boys: number
  rev_children_girls: number

  // Offerings
  tithes_offering: number
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
    bs_adult_men: 0, bs_adult_women: 0,
    bs_youth_boys: 0, bs_youth_girls: 0,
    bs_children_boys: 0, bs_children_girls: 0,
    rev_adult_men: 0, rev_adult_women: 0,
    rev_youth_boys: 0, rev_youth_girls: 0,
    rev_children_boys: 0, rev_children_girls: 0,
    tithes_offering: 0, special_offering: 0,
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

  const revAdult = r.rev_adult_men + r.rev_adult_women
  const revYouth = r.rev_youth_boys + r.rev_youth_girls
  const revChildren = r.rev_children_boys + r.rev_children_girls

  return {
    worshipAdult, worshipYouth, worshipChildren, worshipSubtotal,
    bsAdult, bsYouth, bsChildren,
    revAdult, revYouth, revChildren,
    totalOffering: r.tithes_offering + r.special_offering,
  }
}
