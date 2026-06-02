// Single source of truth for all handbook navigation.
// Both GeneralLayout and ProcessMenu import from here.

export interface NavItem {
  title: string;
  path: string;
  order: number;
  external?: boolean;
}

export interface ProcessNavItem extends NavItem {
  section: string;
}

/** Top-level sections shown in the header and mobile sidebar */
export const HANDBOOK_SECTIONS: NavItem[] = [
  { title: 'Fundamentet', path: 'fundamentet', order: 0 },
  { title: 'Praktisk info', path: 'information', order: 1 },
  { title: 'Prosesser', path: 'prosesser', order: 2 },
  { title: 'Lokasjoner', path: 'avdelinger', order: 3 },
];

/** Information sub-pages — shown in header popover and sidebar under /information */
export const INFORMATION_SECTIONS: NavItem[] = [
  { title: 'Om Penger', path: 'information/om-penger', order: 0 },
  { title: 'Om salg', path: 'information/om-salg', order: 1 },
  { title: 'Om tid', path: 'information/om-tid', order: 2 },
  { title: 'Om liv og helse', path: 'information/om-liv-og-helse', order: 3 },
  { title: 'Om ting og tang', path: 'information/om-ting-og-tang', order: 4 },
];

/** Fundamentet sub-pages — shown in header popover and sidebar under /fundamentet */
export const FUNDAMENTET_SECTIONS: NavItem[] = [
  { title: 'Formål og verdier', path: 'fundamentet/formaal-og-verdier', order: 0 },
  { title: 'Selve livet', path: 'fundamentet/selve-livet', order: 1 },
  { title: 'Arbeidet', path: 'fundamentet/arbeidet', order: 2 },
  { title: 'Sosialt', path: 'fundamentet/sosialt', order: 3 },
  { title: 'Penger', path: 'fundamentet/penger', order: 4 },
];

/** Process sub-pages — shown in sidebar and ProcessMenu component */
export const PROCESS_THEMES: ProcessNavItem[] = [
  { section: 'RÅ', title: 'Rå', path: 'prosesser/raa', order: 0 },
  { section: 'Ansatt', title: 'Ansatt', path: 'prosesser/ansatt', order: 1 },
  { section: 'HMS', title: 'HMS', path: 'prosesser/hms', order: 2 },
  { section: 'Bærekraft', title: 'Bærekraft', path: 'prosesser/baerekraft', order: 3 },
  { section: 'Mangfold', title: 'Mangfold', path: 'prosesser/mangfold', order: 4 },
  { section: 'Ledelse', title: 'Ledelse', path: 'prosesser/ledelse', order: 5 },
  { section: 'Sikkerhetshendelser', title: 'Sikkerhetshendelser', path: 'prosesser/sikkerhet', order: 6 },
  { section: 'Avtaler', title: 'Avtaler', path: 'https://avtaler.variant.no/', order: 7, external: true },
];

/** Location pages — shown in sidebar under /avdelinger */
export const LOCATIONS: NavItem[] = [
  { title: 'Trondheim', path: 'avdelinger/trondheim', order: 0 },
  { title: 'Oslo', path: 'avdelinger/oslo', order: 1 },
  { title: 'Bergen', path: 'avdelinger/bergen', order: 2 },
  { title: 'Stavanger', path: 'avdelinger/stavanger', order: 3 },
];
