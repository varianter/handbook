declare var md_section: {
  getHeadlines: (
    content: string,
    { minLevel: number, maxLevel: number }
  ) => { level: number; content: string }[];
};

declare module "@variant/md-section" {
  export = md_section;
}
