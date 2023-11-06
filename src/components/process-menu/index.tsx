import { PageSelector } from '../page-selector';

export function ProcessMenu() {
  return (
    <PageSelector
      sections={[
        { section: 'Ansatt', href: './prosesser-ansatt' },
        { section: 'HMS', href: './prosesser-hms' },
        { section: 'Bærekraft', href: './prosesser-baerekraft' },
        { section: 'Mangfold', href: './prosesser-mangfold' },
        { section: 'Ledelse', href: './prosesser-ledelse' },
        { section: 'Avtaler', href: 'https://avtaler.variant.no/' },
      ]}
    />
  );
}
