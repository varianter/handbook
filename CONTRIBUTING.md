# Contribution guidelines for Variant systems

In this document, there are established procedures and help on how to contribute
to the content, fixes, and changes on the systems of Variant. This includes the
website, handbook, style guide, and all other systems found under
https://github.com/varianter. Even this document is open to suggestions for
changes.

## Main guideline

We should be polite and friendly to all those who contribute, whether it be with
comments or changes to the content. It is important to respect others' time and
efforts. This also applies to other commenters. If someone breaks this
guideline, necessary action should be taken (potentially excluding the person
from the project if necessary).

All contributions can be considered inbound=outbound. Meaning your contribution
will be covered by the same license as the rest of the content and code.

## How to contribute

### Via Github interface

1. See how to edit files via the Github interface:
   https://help.github.com/articles/editing-files-in-your-repository/
2. Select the `Create new branch` option and press `Propose file change`
3. Fill out the _pull request_ description with
   [information following the format specified below](#pull-request-description)

### From local (development)

Here is a very brief list of how to proceed. We do not try to be too accurate
and detailed here, as there are already many good resources for this. Below is a
summary, but if you want a more detailed procedure, we recommend checking out
[opensource.guide](https://opensource.guide/how-to-contribute/) from Github.

1. Install and configure git
   - Via terminal: https://help.github.com/articles/set-up-git/
   - Via own client: https://desktop.github.com/
2. Install node.js:
   - Latest version: https://nodejs.org/en/
   - Advanced: To select a version and stay updated:
     https://github.com/creationix/nvm
3. Download relevant project:
   - E.g handbook: `git clone https://github.com/varianter/handbook.git`
   - Navigate to the project `cd handbook`
4. Perform steps in README.md for local setup.
5. Make changes to files and check that everything looks good and works.
6. If README.md says there are tests, run `npm run test` or what README.md
   specifies
7. Create a new [branch](https://guides.github.com/introduction/flow/):
   `git checkout -b uniqueName`
8. Save the changes to git:
   1. `git add <file with changes>`
   2. `git commit -m 'Descriptive change'`. The message described here should be
      kept concrete and concise. It is important that they summarize actual
      changes.
9. Push the changes to Github: `git push origin uniqueName`
10. Navigate to the _repo_: https://github.com/varianter/handbook
11. Press the `Compare & pull request` button next to the `Branch` dropdown menu
12. Fill out the _pull request_ description with
    [information following the format specified below](#pull-request-description)

### Pull request description

When creating a pull request (suggestion for change), it is important that the
description provides enough context for someone to understand the reasoning
behind the change. This means that the following information should usually be
included:

1. What this change will do
2. Why this change is needed
3. What information is needed to make an assessment

By providing this information, it will be much easier to assess the changes,
both technical and content-related, which in turn will allow the changes to be
implemented more quickly.

## Handling incoming pull requests and issues

This section applies to anyone with the rights to approve and incorporate
changes. It covers how we operate in bringing in changes and the procedures we
should have in place to quality-assure content. The focus here is not to prevent
changes to the systems, but to avoid mistakes. This can be particularly
intimidating for new employees, and we want to lower the threshold for making
changes.

It is important to be accommodating and polite in communication and discussions
on pull requests and issues. This applies to everyone who contributes, whether
they are colleagues or external. This is obvious, but it must be said. **Respect
the time that has gone into contributing**.

### Approval

For a pull request to be approved, the following must be fulfilled and done:

1. At least one reviewer must be assigned.
2. If additional input is needed, tag teams such as @variant/styre and the like.
3. Reviewers review and provide input on any necessary changes.
4. Reviewer approves.
5. Then the changes can be merged. Prefer the "Squash and merge"
6. Thank for contribution and high fives all around.

### Code Review practise

[Read full guide in blogpost](https://blog.variant.no/7-tips-for-better-code-reviews-ab06b87534bc).

1. Be nice!
2. Take the time to understand the underlying goal for the pull request.
3. Provide suggestions for improvement. Show solutions rather than problems.
4. Avoid stylistic, overly nit-picky comments.
5. Don't be afraid to check out the changes locally.
6. Ask (open-ended) questions.
7. Optimize for throughput, not for gatekeeping.
