/**
 * moment ships its locale files as plain JavaScript with no accompanying
 * type declarations, so importing one for its side effect — which is the
 * only way to register a locale — is a `tsc` error without this.
 *
 * Declared as a wildcard rather than one entry per locale: they all have
 * the same (empty) shape, and a new locale added to ./format shouldn't need
 * a second edit here to compile.
 *
 * Ambient declarations are global wherever the file sits; this one lives
 * next to its only consumer so the reason for it is one file away, the same
 * way `constants/env` keeps its own `index.d.ts` beside the JavaScript it
 * describes.
 */
declare module "moment/locale/*";
