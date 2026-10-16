// readinglistIO.js - export / import of the reading list as a JSON file.
// Pure functions so they can be unit tested without the browser.
export const EXPORT_FORMAT = 'shelfseeker-reading-list';
export const EXPORT_VERSION = 1;
const STATUSES = ['want', 'reading', 'done'];

export function serializeList(items, now = new Date()) {
  return JSON.stringify(
    { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: now.toISOString(), items },
    null,
    2
  );
}

// Returns { items, skipped } or throws Error with a user-readable message.
export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error('That file is not valid JSON.');
  }
  const list = Array.isArray(data) ? data : data && data.format === EXPORT_FORMAT ? data.items : null;
  if (!Array.isArray(list)) {
    throw new Error('That file is not a ShelfSeeker reading list export.');
  }
  if (data && !Array.isArray(data) && typeof data.version === 'number' && data.version > EXPORT_VERSION) {
    throw new Error('That export was made by a newer version of ShelfSeeker.');
  }
  const items = [];
  let skipped = 0;
  list.forEach((raw) => {
    if (
      raw && typeof raw === 'object' &&
      typeof raw.id === 'string' && raw.id.trim() !== '' &&
      typeof raw.title === 'string' && raw.title.trim() !== '' &&
      STATUSES.includes(raw.status)
    ) {
      items.push({
        id: raw.id,
        title: raw.title,
        author: typeof raw.author === 'string' ? raw.author : '',
        cover_img: typeof raw.cover_img === 'string' ? raw.cover_img : '',
        status: raw.status,
        addedAt: typeof raw.addedAt === 'number' ? raw.addedAt : Date.now(),
      });
    } else {
      skipped += 1;
    }
  });
  if (items.length === 0) {
    throw new Error(skipped > 0 ? 'No valid books found in that file.' : 'That file has no books in it.');
  }
  return { items, skipped };
}

// Imported books win when the same id exists. Returns { items, added, updated }.
export function mergeItems(current, imported) {
  const byId = new Map(current.map((item) => [item.id, item]));
  let added = 0;
  let updated = 0;
  imported.forEach((item) => {
    const existing = byId.get(item.id);
    if (!existing) added += 1;
    else if (existing.status !== item.status) updated += 1;
    byId.set(item.id, { ...(existing || {}), ...item });
  });
  return { items: [...byId.values()], added, updated };
}
