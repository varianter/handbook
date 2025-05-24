import { PageSelector } from '../page-selector';

export function ProcessMenu() {
  return (
    <PageSelector
      sections={[
        { section: 'RÅ', href: './prosesser-raa' },
        { section: 'Ansatt', href: './prosesser-ansatt' },
        { section: 'HMS', href: './prosesser-hms' },
        { section: 'Bærekraft', href: './prosesser-baerekraft' },
        { section: 'Mangfold', href: './prosesser-mangfold' },
        { section: 'Ledelse', href: './prosesser-ledelse' },
        { section: 'Sikkerhetshendelser', href: './prosesser-sikkerhet' },
        { section: 'Avtaler', href: 'https://avtaler.variant.no/' },
      ]}
    />
  );
}
