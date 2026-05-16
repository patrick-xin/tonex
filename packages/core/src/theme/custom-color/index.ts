// why: custom-color/ groups the custom-color slot capability — the slot type
// (CustomColorEntry), slug derivation, validation rules, and the preview
// helper that mirrors deriveTheme's customColor() call for the create/edit
// dialog. Lifted from theme/schema.ts in #64 so the persisted-shape file
// stops owning runtime helpers; schema.ts re-imports slugify + validate to
// keep its valibot pipe self-contained. Internal cross-file imports inside
// custom-color/ stay on direct sibling paths (./entry, ./custom-color) so
// the barrel doesn't introduce circular-import risk within the folder.

export {
  type CustomColorPreview,
  type CustomColorPreviewRoles,
  previewCustomColor,
} from './custom-color'
export {
  type CustomColorEntry,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './entry'
