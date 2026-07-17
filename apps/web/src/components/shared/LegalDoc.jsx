import PageHero from './PageHero'

// Khung chung cho các trang pháp lý (Điều khoản, Quyền riêng tư, Nội quy).
//
// Thân văn bản luôn giữ tiếng Việt kể cả khi UI đổi sang tiếng Anh: đây là văn bản
// pháp lý và phải khớp TỪNG CHỮ với bản trong app. Quyết định này đã có sẵn trong
// NODIE/Features/Profile/TermsOfUseView.swift — web chép theo, không tự dịch.
// Chrome của trang (eyebrow/title/subtitle) thì theo ngôn ngữ UI như mọi trang khác.
export default function LegalDoc({ eyebrow, title, titleEm, subtitle, sections, updated, note }) {
  return (
    <section className="section legal-doc">
      <PageHero eyebrow={eyebrow} title={title} titleEm={titleEm} subtitle={subtitle} />

      <div className="legal-body fade-up fade-up-d1">
        {note && <p className="legal-note">{note}</p>}

        {sections.map((s) => (
          <article key={s.title} className="legal-section">
            <h2 className="legal-section-title">{s.title}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
        ))}

        <p className="legal-updated">{updated}</p>
      </div>
    </section>
  )
}
