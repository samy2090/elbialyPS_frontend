/**
 * Shared helpers for normalising comment data from APIs (flat or nested, various field names).
 * Use for home feed, profile, and admin comments modal so level 1 and level 2 comments display correctly.
 */

/**
 * Normalise backend parent reference (support different field names and string/number id).
 * @param {Object} comment
 * @returns {number|null}
 */
export function getCommentParentId(comment) {
  if (!comment) return null
  const raw =
    comment.parent_id ??
    comment.parentId ??
    comment.parent_comment_id ??
    (comment.parent && (comment.parent.id ?? comment.parent_id)) ??
    null
  if (raw == null || raw === '') return null
  return Number(raw)
}

/**
 * Normalize API response so we always have a flat array with parent_id on replies.
 * Handles: (1) flat list with parent_id, (2) nested list with replies array, (3) response in res.data.data or res.data.comments.
 * @param {{ data?: any, meta?: any }} res - Response from getComments / getCommentsForPost
 * @returns {Array}
 */
export function normalizeCommentsResponse(res) {
  let raw = res?.data
  if (Array.isArray(raw)) {
    // already array
  } else if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
    raw = raw.data
  } else if (raw && typeof raw === 'object' && Array.isArray(raw.comments)) {
    raw = raw.comments
  } else {
    raw = []
  }

  const flat = []
  for (const c of raw) {
    if (!c || typeof c !== 'object') continue
    const replies = c.replies ?? c.children ?? []
    const parentId = c.id != null ? Number(c.id) : null
    const { replies: _r, children: _c, ...rest } = c
    flat.push({ ...rest, id: c.id, parent_id: getCommentParentId(c) ?? null })
    for (const r of replies) {
      if (!r || typeof r !== 'object') continue
      const parentIdSet =
        r.parent_id != null || r.parent_comment_id != null
          ? r
          : { ...r, parent_id: parentId }
      flat.push(parentIdSet)
    }
  }
  return flat
}

/**
 * Build nested structure (top-level comments with replies array) from a flat list.
 * Use after normalizeCommentsResponse. IDs are compared as numbers so string/number mismatch is handled.
 * @param {Array} list - Flat list of comments (each with parent_id or null for top-level)
 * @returns {Array} Top-level comments with .replies sorted by created_at
 */
export function buildNestedComments(list) {
  if (!list?.length) return []
  const top = list
    .filter((c) => getCommentParentId(c) == null)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  const byParent = new Map()
  list.forEach((c) => {
    const parentId = getCommentParentId(c)
    if (parentId != null) {
      if (!byParent.has(parentId)) byParent.set(parentId, [])
      byParent.get(parentId).push(c)
    }
  })
  return top.map((c) => {
    const id = c.id != null ? Number(c.id) : c.id
    const replies = (byParent.get(id) ?? []).sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
    )
    return { ...c, replies }
  })
}
