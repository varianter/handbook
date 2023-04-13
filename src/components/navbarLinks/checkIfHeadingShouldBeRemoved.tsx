/**
 * Sjekker om headingen skal være med eller ikke
 * @param headingValue
 * @returns true hvis den skal fjernes. false hvis den skal inkluderes
 */

const checkIfHeadingShouldBeRemoved = (headingValue: string) => {
  if (headingValue === 'Vårt formål er å utvikle samfunnet vi lever i') {
    return true;
  }
  return false;
};

export default checkIfHeadingShouldBeRemoved;
