import { useState } from 'react'
import { api } from '../../api/client.js'
import { formatDateTime } from '../../lib/format.js'
import { useFetch } from '../../lib/hooks.js'

const TOPIC_LABEL = { GENERAL: 'Hello', BUSINESS: 'Business', PROBLEM: 'Problem', FEEDBACK: 'Feedback' }

export default function InboxTab({ onChange }) {
  const [unreadOnly, setUnreadOnly] = useState(true)
  const { phase, data, setData } = useFetch(() => api.admin.messages({ handled: unreadOnly ? false : undefined, size: 20 }), [unreadOnly])

  async function toggle(message) {
    const updated = await api.admin.setHandled(message.id, !message.handled).catch(() => null)
    if (!updated) return
    setData((d) => ({ ...d, content: unreadOnly && updated.handled ? d.content.filter((m) => m.id !== updated.id) : d.content.map((m) => (m.id === updated.id ? updated : m)) }))
    onChange?.()
  }

  return (
    <section className="panel admin-section" aria-labelledby="inbox-title">
      <div className="inbox__head">
        <h2 id="inbox-title">Inbox</h2>
        <div className="chips" role="group" aria-label="Which messages">
          <button type="button" className="chip" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>Needs a reply</button>
          <button type="button" className="chip" aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>All messages</button>
        </div>
      </div>

      {phase === 'loading' && <p className="loading loading--inline" role="status">Loading…</p>}
      {phase === 'error' && <p className="alert" role="alert">We couldn’t load the inbox.</p>}
      {phase === 'ready' && data?.content.length === 0 && <p className="empty empty--inline">{unreadOnly ? 'All caught up. No messages waiting.' : 'No messages yet.'}</p>}

      <ul className="inbox__list">
        {data?.content.map((m) => (
          <li key={m.id} className={m.handled ? 'is-done' : ''}>
            <div className="inbox__meta">
              <span className="role">{TOPIC_LABEL[m.topic] ?? m.topic}</span>
              <strong>{m.name}</strong>
              <a href={`mailto:${m.email}`}>{m.email}</a>
              <time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time>
            </div>
            <p>{m.message}</p>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => toggle(m)}>{m.handled ? 'Mark as unread' : 'Mark as handled'}</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
