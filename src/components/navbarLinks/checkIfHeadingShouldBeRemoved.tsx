/**
 * Sjekker om headingen skal være med eller ikke
 * @param headingValue
 * @returns true hvis den skal fjernes. false hvis den skal inkluderes
 */

const checkIfHeadingShouldBeRemoved = (toc: TocItem) => {
  return toc.attributes.className.includes("toc-ignore") ?? false; 
 };

export default checkIfHeadingShouldBeRemoved;
