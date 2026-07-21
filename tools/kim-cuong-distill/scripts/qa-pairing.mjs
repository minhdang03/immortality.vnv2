function messageTime(message) {
  const iso = Date.parse(message.ts_iso || '')
  if (Number.isFinite(iso)) return iso
  const raw = Number(message.ts || 0)
  return Number.isFinite(raw) ? raw : 0
}

export function isTeacher(message, config) {
  if (message.role === 'teacher') return true
  if (config.teacher_uids?.includes(String(message.uid_from))) return true
  const name = (message.display_name || '').toLowerCase()
  return (config.teacher_name_hints || []).some((hint) => hint && name.includes(hint.toLowerCase()))
}

export function pairKey(questionId, answerId) {
  return `${questionId}::${answerId}`
}

function answerShape(message) {
  return {
    msg_id: message.msg_id,
    from: message.display_name,
    uid: message.uid_from,
    ts: message.ts_iso || message.ts,
    text: message.text,
  }
}

export function buildQaItems(messages, config, decisions = {}, previousItems = []) {
  const normalized = messages.map((message) => ({
    ...message,
    role: isTeacher(message, config) ? 'teacher' : 'student',
  })).sort((a, b) => messageTime(a) - messageTime(b))
  const byId = new Map(normalized.map((message) => [message.msg_id, message]))
  const previous = new Map(previousItems.map((item) => [item.question?.msg_id, item]))
  const assignments = new Map()
  const verifiedByQuestion = new Map()
  const claimedVerifiedAnswers = new Set()
  const pairDecisions = Object.values(decisions.pairs || {})
    .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
  for (const decision of pairDecisions) {
    if (
      decision.status === 'verified' && byId.has(decision.answer_msg_id) &&
      !verifiedByQuestion.has(decision.question_msg_id) &&
      !claimedVerifiedAnswers.has(decision.answer_msg_id)
    ) {
      verifiedByQuestion.set(decision.question_msg_id, decision)
      claimedVerifiedAnswers.add(decision.answer_msg_id)
    }
  }
  const verifiedAnswerIds = new Set([...verifiedByQuestion.values()].map((item) => item.answer_msg_id))
  const assignedQuestions = new Set(verifiedByQuestion.keys())
  const maxMessages = config.reply_window_msgs || 40
  const maxMs = config.reply_window_ms || 172800000
  let previousTeacherIndex = -1

  // One teacher message can nominate only the nearest unmatched student since the
  // previous teacher turn. Without reply metadata this remains a review candidate.
  for (let teacherIndex = 0; teacherIndex < normalized.length; teacherIndex++) {
    const teacher = normalized[teacherIndex]
    if (teacher.role !== 'teacher' || !String(teacher.text || '').trim()) continue
    if (verifiedAnswerIds.has(teacher.msg_id)) {
      previousTeacherIndex = teacherIndex
      continue
    }
    let selected = null
    for (let index = teacherIndex - 1; index > previousTeacherIndex; index--) {
      const question = normalized[index]
      if (teacherIndex - index > maxMessages) break
      if (question.role !== 'student' || assignedQuestions.has(question.msg_id)) continue
      if (!String(question.text || '').trim()) continue
      const delta = messageTime(teacher) - messageTime(question)
      if (delta < 0 || delta > maxMs) continue
      selected = { question, answer: teacher, distance_messages: teacherIndex - index, delay_ms: delta }
      break
    }
    if (selected) {
      assignments.set(selected.question.msg_id, selected)
      assignedQuestions.add(selected.question.msg_id)
    }
    previousTeacherIndex = teacherIndex
  }

  return normalized.filter((message) => (
    message.role === 'student' && String(message.text || '').trim() &&
    !config.student_exclude_uids?.includes(String(message.uid_from))
  )).map((question) => {
    const prior = previous.get(question.msg_id)
    const editorial = decisions.questions?.[question.msg_id] || {}
    const verified = verifiedByQuestion.get(question.msg_id)
    const verifiedAnswer = verified ? byId.get(verified.answer_msg_id) : null
    const inferred = assignments.get(question.msg_id)
    const answer = verifiedAnswer || inferred?.answer || null
    const decision = answer ? decisions.pairs?.[pairKey(question.msg_id, answer.msg_id)] : null
    const status = verifiedAnswer ? 'verified' : decision?.status === 'rejected'
      ? 'rejected' : answer ? 'candidate' : 'unanswered'
    return {
      id: prior?.id || `qa-${question.msg_id}`,
      question: answerShape(question),
      answer: answer ? answerShape(answer) : null,
      status,
      pairing_evidence: verifiedAnswer ? { method: 'human-verified', authoritative: true } : inferred ? {
        method: 'nearest-unmatched-before-teacher',
        authoritative: false,
        distance_messages: inferred.distance_messages,
        delay_ms: inferred.delay_ms,
      } : null,
      tags: editorial.tags || prior?.tags || [],
      notes: editorial.notes ?? prior?.notes ?? '',
      distilled: editorial.distilled ?? prior?.distilled ?? null,
      updated_at: editorial.updated_at || prior?.updated_at || new Date().toISOString(),
    }
  })
}
