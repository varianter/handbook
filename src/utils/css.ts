export const and = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(' ');
export const ifCss = (pred: boolean, className: string) =>
  pred ? className : undefined;
