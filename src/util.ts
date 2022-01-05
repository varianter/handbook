export function slugify(heading: string) {
  return heading.replace(/[ -]+/g, "-").toLowerCase();
}
