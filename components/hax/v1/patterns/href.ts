// Where a pattern's own page lives. /patterns/<id> already belongs to the older IoC research
// pages (app/(site)/patterns/[slug]), and 12 of their slugs are also ids here, so for now the
// HAX pattern pages sit at /interaction-patterns/<id>. The index and its filters stay at /patterns.
// Every link goes through this, so moving the pages is a one-line change.
export const patternHref = (id: string) => `/interaction-patterns/${id}`;
