/**
 * useComments — Supabase-backed comments for a content item.
 *
 * Anon: INSERT { content_id, author_name, body } (server forces status='pending');
 *       reads only status='visible' rows (RLS). Admin: reads all + moderates.
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase-client'

const RATE_LIMIT_KEY = 'comment_timestamps'
const RATE_LIMIT_MAX = 2
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function isRateLimited() {
  const raw = localStorage.getItem(RATE_LIMIT_KEY)
  const timestamps = raw ? JSON.parse(raw) : []
  const now = Date.now()
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  return recent.length >= RATE_LIMIT_MAX
}

function recordSubmission() {
  const raw = localStorage.getItem(RATE_LIMIT_KEY)
  const timestamps = raw ? JSON.parse(raw) : []
  const now = Date.now()
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify([...recent, now]))
}

// Map a Supabase row → shape the comment UI expects ({ name, text, status }).
function adaptComment(row) {
  return { id: row.id, name: row.author_name, text: row.body, status: row.status, createdAt: row.created_at }
}

export function useComments(articleId, isAdmin = false) {
  const [comments, setComments] = useState([])

  const reload = useCallback(async () => {
    if (!articleId || !supabase) return
    let q = supabase.from('comments').select('*').eq('content_id', articleId).order('created_at', { ascending: true })
    if (!isAdmin) q = q.eq('status', 'visible')
    const { data, error } = await q
    if (!error) setComments((data ?? []).map(adaptComment))
  }, [articleId, isAdmin])

  useEffect(() => { reload() }, [reload])

  const addComment = async (name, text) => {
    if (isRateLimited()) return { error: 'rate_limited' }
    if (!supabase) return { error: 'write_failed' }
    // Plain insert (no .select()): the new row is 'pending' → not anon-readable.
    const { error } = await supabase.from('comments').insert({ content_id: articleId, author_name: name, body: text })
    if (error) return { error: 'write_failed' }
    recordSubmission()
    return {}
  }

  const approveComment = async (id) => {
    if (!supabase) return
    await supabase.from('comments').update({ status: 'visible' }).eq('id', id)
    reload()
  }

  const deleteComment = async (id) => {
    if (!supabase) return
    await supabase.from('comments').delete().eq('id', id)
    reload()
  }

  return { comments, addComment, approveComment, deleteComment }
}
