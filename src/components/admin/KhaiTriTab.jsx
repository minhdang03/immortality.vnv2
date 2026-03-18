import { useState } from 'react'
import AutoTextarea from './AutoTextarea'

export default function KhaiTriTab({ t, lang, items, onAdd, onUpdate, onDelete }) {
  const EMPTY = {
    order: items.length + 1, date: new Date().toISOString().split('T')[0],
    tagVi: '', tagEn: '', titleVi: '', titleEn: '',
    questionVi: '', questionEn: '', summaryVi: '', summaryEn: '', bodyVi: '', bodyEn: '',
  }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLang, setFormLang] = useState('vi')
  const [preview, setPreview] = useState(false)
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: items.length + 1 }); setEditing('new'); setFormLang('vi'); setPreview(false) }
  const startEdit = (a) => {
    setForm({
      order: a.order ?? 0, date: a.date || '',
      tagVi: a.tag?.vi || '', tagEn: a.tag?.en || '',
      titleVi: a.vi?.title || '', titleEn: a.en?.title || '',
      questionVi: a.vi?.question || '', questionEn: a.en?.question || '',
      summaryVi: a.vi?.summary || '', summaryEn: a.en?.summary || '',
      bodyVi: a.vi?.body || '', bodyEn: a.en?.body || '',
    })
    setEditing(a.id); setFormLang('vi'); setPreview(false)
  }

  const handleSave = async () => {
    const data = {
      order: Number(form.order), date: form.date,
      tag: { vi: form.tagVi, en: form.tagEn },
      vi: { title: form.titleVi, question: form.questionVi, summary: form.summaryVi, body: form.bodyVi },
      en: { title: form.titleEn, question: form.questionEn, summary: form.summaryEn, body: form.bodyEn },
    }
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing, data)
    setEditing(null); setForm(EMPTY)
  }

  const handleDelete = async (id) => { if (window.confirm(t.adminConfirmDelete)) await onDelete(id) }

  // Split long Q&A body into separate items
  const splitQA = () => {
    const body = form.bodyVi || form.bodyEn || ''
    const blocks = body.split('\n\n').map(b => b.trim()).filter(Boolean)

    // Group blocks into Q&A pairs
    const pairs = []
    let currentQ = ''
    let currentA = ''

    for (const block of blocks) {
      const isQ = /^(Hỏi|Question|Q)\s*[:：]/i.test(block)
      const isA = /^(Đáp|Trả lời|Answer|A)\s*[:：]/i.test(block)

      if (isQ) {
        if (currentQ && currentA) {
          pairs.push({ q: currentQ, a: currentA })
          currentA = ''
        }
        currentQ = block.replace(/^(Hỏi|Question|Q)\s*[:：]\s*/i, '').trim()
      } else if (isA) {
        currentA = block.replace(/^(Đáp|Trả lời|Answer|A)\s*[:：]\s*/i, '').trim()
      } else {
        // Continuation of previous block
        if (currentA) currentA += '\n\n' + block
        else if (currentQ) currentQ += '\n\n' + block
      }
    }
    if (currentQ && currentA) pairs.push({ q: currentQ, a: currentA })

    if (pairs.length < 2) {
      alert(lang === 'vi'
        ? 'Không tìm thấy nhiều cặp Hỏi/Đáp để tách. Cần ít nhất 2 cặp "Hỏi:" và "Đáp:" trong nội dung.'
        : 'Not enough Q&A pairs found. Need at least 2 "Hỏi:/Đáp:" pairs in the body.')
      return
    }

    const baseTitle = form.titleVi || form.titleEn || ''
    const msg = lang === 'vi'
      ? `Tìm thấy ${pairs.length} cặp Hỏi/Đáp. Tách thành ${pairs.length} items riêng?\n\nItem gốc sẽ giữ cặp đầu tiên, còn lại tạo mới.`
      : `Found ${pairs.length} Q&A pairs. Split into ${pairs.length} separate items?\n\nOriginal keeps first pair, rest are created new.`

    if (!window.confirm(msg)) return

    // Update current item with first pair
    setField('questionVi', pairs[0].q)
    setField('bodyVi', `Hỏi: ${pairs[0].q}\n\nĐáp: ${pairs[0].a}`)
    if (form.summaryVi) setField('summaryVi', pairs[0].a.slice(0, 150) + (pairs[0].a.length > 150 ? '...' : ''))

    // Create new items for remaining pairs
    const baseOrder = Number(form.order) || 1
    pairs.slice(1).forEach(async (pair, i) => {
      const newOrder = baseOrder + i + 1
      const shortTitle = pair.q.length > 80 ? pair.q.slice(0, 80) + '...' : pair.q
      await onAdd({
        order: newOrder,
        date: form.date,
        tag: { vi: form.tagVi, en: form.tagEn },
        vi: {
          title: `${baseTitle} (${i + 2})`,
          question: pair.q,
          summary: pair.a.slice(0, 150) + (pair.a.length > 150 ? '...' : ''),
          body: `Hỏi: ${pair.q}\n\nĐáp: ${pair.a}`
        },
        en: { title: '', question: '', summary: '', body: '' }
      })
    })

    alert(lang === 'vi'
      ? `Đã tách thành ${pairs.length} items. Nhấn Lưu để cập nhật item gốc.`
      : `Split into ${pairs.length} items. Click Save to update the original.`)
  }

  const L = formLang === 'vi' ? 'Vi' : 'En'

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-read" onClick={startNew}>{lang === 'vi' ? 'Thêm Khai Trí' : 'Add Khai Trí'}</button>
        <button className="btn-sm" onClick={async () => {
          if (!window.confirm(lang === 'vi'
            ? 'Seed bài "Khai Trí: Năng Lượng, Ánh Sáng và Bất Tử Đạo" (6 cặp Hỏi/Đáp)?'
            : 'Seed "Khai Trí: Energy, Light and Immortality Path" (6 Q&A pairs)?')) return
          const maxOrder = items.reduce((m, it) => Math.max(m, it.order || 0), 0)
          await onAdd({
            order: maxOrder + 1,
            date: '2026-03-18',
            tag: { vi: 'Năng Lượng', en: 'Energy' },
            vi: {
              title: 'Khai Trí: Năng Lượng, Ánh Sáng và Bất Tử Đạo',
              question: 'Bất Tử Đạo chủ yếu chỉ cho con người sử dụng năng lượng vật chất, chuyển đổi năng lượng cho bản thân mình và các vong linh?',
              summary: 'Giải đáp về bản chất năng lượng Big Bang, linh hồn của ánh sáng, sự khác biệt giữa Bất Tử Đạo và Phật giáo, bằng chứng sự sống bất tử, và cốt lõi của thực hành.',
              body: 'Hỏi: Dạ thưa Thầy, con mới được tiếp xúc nghe Thầy giảng về năng lượng và ADN. Vậy Bất Tử Đạo chủ yếu chỉ cho con người sử dụng năng lượng vật chất, chuyển đổi năng lượng cho bản thân mình và các vong linh, rồi năng lượng này chuyển về hố đen để tái chế hoặc vào vũ trụ Big Bang?\nVấn đề ở đây: cái năng lượng đó bao gồm những yếu tố gì? Nó có trạng thái tâm thức hay không? Trạng thái ánh sáng năng lượng Big Bang nó như thế nào? Nó có từ bi, trí huệ, có linh hồn, hay nó chỉ là ánh sáng vô hồn? Nhờ Thầy khai thị chỗ này để chúng con rõ đường đi hơn ạ.\n\nĐáp: Big Bang gồm hai nguồn năng lượng: điện âm và điện dương hút nhau. Giống như đàn ông đàn bà hút lấy nhau rồi sinh ra em bé. Vũ trụ thì tạo ra một vụ nổ lớn sinh ra vạn vật.\nMuốn tìm hiểu thêm nguyên lý năng lượng chứa gì thì phải học hỏi theo khoa học, kết hợp lại với thấy nghe biết hiểu, sẽ rõ ràng hơn.\nChúng ta được sinh ra từ sự va chạm, thúc đẩy, bùng nổ, tan vỡ từ mảnh nhỏ hạt bụi. Mệt mỏi, đau bệnh, ung thư, tai nạn đều đến từ sự va chạm thúc đẩy của Big Bang ADN. Không muốn đau bệnh chết thì chỉ có sự thấy, biết, hiểu và không va chạm. Chỉ trao đổi, chỉ yêu thương mà sống thì không gây ra chia ly.\nSự sống tự mỗi người đã đầy đủ. Không tranh giành, không phân biệt, không chiến tranh màu da sắc tộc, không phân biệt tôn giáo. Tất cả chúng ta là một. Lúc đó mới đạt được tình yêu thương đại đồng, hợp nhất một giống loài người, thương yêu nhau, giúp đỡ nhau, chia sẻ bình đẳng. Tương lai đó mới gọi là thiên đường tại thế: tự do, bình đẳng, trí tuệ, hạnh phúc viên mãn.\n\nHỏi: Vậy ánh sáng có linh hồn hay không?\n\nĐáp: Bóng tối hay ánh sáng đều có linh hồn. Bóng tối linh hồn thì chứa đựng tất cả. Ánh sáng linh hồn thì ban phát cho tất cả. Ánh sáng chỉ có một, và nó chuyển đổi thành nhiều ánh sáng khác nhau, có màu sắc khác nhau, ngôn ngữ giao tiếp cũng khác nhau. Ánh sáng cuối cùng là ánh sáng vô nhiễm.\n\nHỏi: Còn nói về Phật giáo, theo con được tìm hiểu thì mỗi người nhìn lời Phật dạy ở nhiều góc cạnh khác nhau. Nhưng cốt lõi của đạo Phật hướng về tâm thức: vạn pháp duy tâm tạo, mình là chủ nhân của nghiệp thân ý khẩu, nhân duyên nhân quả, luân hồi sanh tử theo dòng nghiệp thức mà chính mình tạo tác. Điểm cuối đạo Phật: mọi việc đã trải nghiệm, việc làm đã xong, nhân quả trả vay đã hết, niết bàn tịch tĩnh, trạng thái biết hết thấu hết vạn pháp nhưng không còn dính vào nhân quả ba đường sáu cõi. Ý con biết vậy.\n\nĐáp: Rồi ông Phật có thoát được chưa?\nÔng Phật là người chứng Đạo, thấy được Đạo, chứ không phải là người đạt Đạo. Ông Phật nói về tánh không nhưng lại nói về tâm có, cho nên vẫn còn dính chấp và không nhập vào Bất Tử Đạo được. Cho nên vẫn phải chết.\nNói rằng linh hồn để được giải thoát, nhưng hồn không độ được xác thì vẫn phải quay lại luân hồi mãi mãi, vì bài học vẫn chưa xong. Ông Phật không biết cách dạy, cũng không biết cách độ ai cả. Chính ông ta cũng nói như vậy. Những người học vẫn u mê, vẫn tìm về cõi chết là bóng tối, chứ không phải tìm về ánh sáng để được sống bất tử tại thế.\nBất Tử Đạo giảng là Không Đạo. Cho nên không có giáo chủ, không có tâm, không có tánh, không có giới luật, không có cúng dường quỳ lạy, không có đau bệnh ung thư tai nạn, không có địa ngục. Chỉ có thiên đường ánh sáng. Ai học về Không Đạo thì vào được.\nNếu đạo Phật ok thì bây giờ đâu có lòi ra những cái ung thư thối hoắc? Tiền cúng dường cho Phật mấy ngàn năm nay lên đến hàng tỷ tỷ đô. Nếu đem tiền đó xây dựng thì đã được thiên đường tại thế rồi, không phải địa ngục trần gian.\n\nHỏi: Vậy bằng chứng sự sống bất tử nằm ở đâu?\n\nĐáp: Vũ trụ đã cho chúng ta thấy rồi. Rùa ăn uống thô sơ, không y tế chăm sóc, mà vẫn sống hơn 200 tuổi. Thực vật cũng vậy: phía trên ngọn lá hút năng lượng ánh sáng mặt trời, va chạm với metan dưới lòng đất, tạo ra khí oxy cho vạn vật hưởng thụ. Ban đêm thì hút oxy lại, thải ra metan carbon. Đó là hành trình sự sống hơn 4000 năm tuổi, sờ sờ trước mắt. Chưa nói đến các loại linh thạch: thạch anh, ruby, hột xoàn, kim cương, tuổi thọ lên đến hàng triệu tỷ năm.\nCái mà chúng ta thấy thì không chịu thấy. Cái ông Phật chỉ là lý thuyết suông mà vẫn lắm người tin. Nếu ông ta hay thì tại sao lại đi ăn nấm độc rồi chết? Trí tuệ ở chỗ nào?\nĐây là trí tuệ khoa học vũ trụ. Ai thích thì học, không thích thì thôi.\n\nHỏi: Bất Tử Đạo là tổ tiên ông bà cha mẹ, cởi mở, là thiên đường. Vậy khi trở về thiên đường rồi thì còn cần gì nữa?\n\nĐáp: Bất Tử Đạo không có tôn giáo, không có giáo chủ. Ai muốn đến thì đến, ai muốn đi thì đi. Không dụ ai vào đạo, cũng không khủng bố tâm tánh ai cả. Vì trong mỗi con người đều có Không Đạo, trí tuệ toàn năng, quyền năng sáng tạo, đầy đủ viên mãn rồi.\nKhi chúng ta trở về thiên đường rồi, thì còn chướng ngại, cố chấp, giới luật của ông Phật để làm gì? Lúc này trí tuệ đã đầy đủ rồi, chỉ có độ tận chúng sinh mà thôi.\nHãy nghĩ: hơn 8 tỷ người đều vào Không Đạo, lúc đó còn chiến tranh, phân biệt sắc tộc, màu da, tôn giáo nào tồn tại để phân biệt chính tà hơn thua nữa hay không? Lúc đó thế giới này là thiên đường hạnh phúc, yêu thương, tự do, bình đẳng. Đây cũng chỉ là một lý thuyết, nhưng phải được thực hành liên tục trong một thời gian lâu dài.\n\nHỏi: Vậy cốt lõi được đưa lên hàng đầu có phải là niềm tin vào sự thật không? Trong khi nhiều người thấy, biết được điều này, thực hành, nhưng nhiều người lại bảo viễn vông, tinh thần bất ổn, rồi chấp nhận cái chết?\n\nĐáp: Cốt lõi không phải là lý thuyết và niềm tin, mà là thực hành để chứng thực. Khi mình cảm nhận được nó rất tốt cho bản thân, tinh thần và trí tuệ của mình, thì lúc đó mới gọi là tạm tin chính mình. Rồi thực hành tiếp, đến khi không còn dính chấp, không còn nghi ngờ, tiếp tục tự tin đi trên con đường mà mình chọn.\nCòn những người không làm được, bất ổn, chấp nhận cái chết, là vì họ tin theo một tôn giáo, một Phật giáo, thì họ phải chịu.\nĐây là một phương pháp khoa học vũ trụ năng lượng ánh sáng trí tuệ. Nói theo Phật học thì gọi là chánh tinh tấn. Nói theo Thiên Chúa học thì là đức tin Tin Lành.',
            },
            en: {
              title: 'Khai Trí: Energy, Light and the Immortality Path',
              question: '', summary: '', body: '',
            },
          })
          alert(lang === 'vi' ? 'Đã seed thành công!' : 'Seeded successfully!')
        }}>
          {lang === 'vi' ? 'Seed: Năng Lượng & Ánh Sáng' : 'Seed: Energy & Light'}
        </button>
      </div>

      {editing !== null && (
        <div className="admin-form">
          <div className="admin-editor-meta">
            <div className="admin-editor-meta-row">
              <div style={{ width: 80 }}>
                <label>{lang === 'vi' ? 'Thứ tự' : 'Order'}</label>
                <input type="number" value={form.order} onChange={e => setField('order', e.target.value)} />
              </div>
              <div style={{ width: 160 }}>
                <label>{t.adminDate}</label>
                <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Tag (VI)</label>
                <input value={form.tagVi} onChange={e => setField('tagVi', e.target.value)} placeholder="Ví dụ: Sức Khỏe" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Tag (EN)</label>
                <input value={form.tagEn} onChange={e => setField('tagEn', e.target.value)} placeholder="e.g. Health" />
              </div>
            </div>
          </div>

          <div className="admin-editor-toolbar">
            <div className="admin-lang-tabs">
              <button className={`admin-lang-tab ${formLang === 'vi' ? 'active' : ''}`} onClick={() => { setFormLang('vi'); setPreview(false) }}>
                Tiếng Việt {form.titleVi && <span className="admin-lang-dot filled" />}
              </button>
              <button className={`admin-lang-tab ${formLang === 'en' ? 'active' : ''}`} onClick={() => { setFormLang('en'); setPreview(false) }}>
                English {form.titleEn ? <span className="admin-lang-dot filled" /> : <span className="admin-lang-dot empty" />}
              </button>
            </div>
            <button className={`admin-preview-btn ${preview ? 'active' : ''}`} onClick={() => setPreview(!preview)}>
              {lang === 'vi' ? (preview ? 'Soạn thảo' : 'Xem trước') : (preview ? 'Edit' : 'Preview')}
            </button>
          </div>

          {!preview ? (
            <div className="admin-editor-fields">
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Tiêu đề' : 'Title'}</label>
                <input value={form[`title${L}`]} onChange={e => setField(`title${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Nhập tiêu đề...' : 'Enter title...'} className="admin-input-title" />
              </div>
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Câu hỏi' : 'Question'}</label>
                <AutoTextarea value={form[`question${L}`]} onChange={e => setField(`question${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Câu hỏi của người hỏi...' : 'The question being asked...'} minRows={2} />
              </div>
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Tóm tắt' : 'Summary'}</label>
                <AutoTextarea value={form[`summary${L}`]} onChange={e => setField(`summary${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Tóm tắt ngắn gọn...' : 'Brief summary...'} minRows={3} />
              </div>
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Nội dung trả lời' : 'Answer content'}</label>
                <AutoTextarea value={form[`body${L}`]} onChange={e => setField(`body${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Câu trả lời đầy đủ...\n\nXuống dòng 2 lần để tạo đoạn mới.' : 'Full answer...\n\nDouble line break for new paragraph.'} minRows={12} />
              </div>
            </div>
          ) : (
            <div className="admin-preview">
              <h1 className="detail-title">{form[`title${L}`] || (formLang === 'vi' ? '(Chưa có tiêu đề)' : '(No title)')}</h1>
              {form[`question${L}`] && <div className="detail-question">{form[`question${L}`]}</div>}
              {form[`summary${L}`] && <div className="article-summary" style={{ marginBottom: 20 }}>{form[`summary${L}`]}</div>}
              <div className="detail-body">{form[`body${L}`] || (formLang === 'vi' ? '(Chưa có nội dung)' : '(No content)')}</div>
            </div>
          )}

          <div className="admin-editor-actions">
            <button className="btn-read" onClick={handleSave}>{t.adminSave}</button>
            <button className="btn-video" onClick={() => setEditing(null)}>{t.adminCancel}</button>
            {(form.bodyVi || form.bodyEn || '').includes('Hỏi:') && (
              <button className="btn-sm" onClick={splitQA} title={lang === 'vi' ? 'Tách các cặp Hỏi/Đáp thành items riêng' : 'Split Q&A pairs into separate items'}>
                {lang === 'vi' ? 'Tách Hỏi/Đáp' : 'Split Q&A'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="admin-articles">
        {items.map(a => (
          <div key={a.id} className="admin-article-item" onClick={() => startEdit(a)} style={{ cursor: 'pointer' }}>
            <div className="admin-article-info">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)', opacity: 0.5, minWidth: 28 }}>
                {String(a.order || 0).padStart(2, '0')}
              </span>
              {a.tag?.vi && <span className="article-tag">{a.tag.vi}</span>}
              <span className="admin-article-title">{a.vi?.title || a.en?.title}</span>
            </div>
            <div className="admin-article-actions" onClick={e => e.stopPropagation()}>
              <button className="btn-sm" onClick={() => startEdit(a)}>{t.adminEdit}</button>
              <button className="btn-sm btn-danger" onClick={() => handleDelete(a.id)}>{t.adminDelete}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có nội dung Khai Trí. Bấm "Thêm Khai Trí" để bắt đầu.' : 'No Khai Trí yet. Click "Add Khai Trí" to start.'}
          </div>
        )}
      </div>
    </>
  )
}
