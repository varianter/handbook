/**
 * Sjekker om headingen skal være med eller ikke
 * @param headingValue
 * @returns true hvis den skal fjernes. false hvis den skal inkluderes
 */

const checkIfHeadingShouldBeRemoved = (toc: TocItem) => {
  if(toc.attributes.className === "toc-ignore") {
      return true
    }
  return false;
};

export default checkIfHeadingShouldBeRemoved;
