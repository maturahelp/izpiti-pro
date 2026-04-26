(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.__mhDiscountPopupInitialized) return
  window.__mhDiscountPopupInitialized = true

  const STORAGE_KEY = 'mh_discount_popup_state'
  const STORAGE_VERSION = '2026-04-26'
  const ROOT_ID = 'mh-discount-popup-root'
  const STYLE_ID = 'mh-discount-popup-style'
  const SHOW_DELAY_MS = 6000
  const POST_CONSENT_DELAY_MS = 4000
  const CODE_10 = 'MATURA10'
  const CODE_15 = 'MATURA015'

  // step: 'email' | 'success10phone' | 'success10done' | 'success15'
  const state = {
    step: 'email',
    open: false,
    email: '',
    phone: '',
    emailError: '',
    phoneError: '',
    submitting: false,
    copied: false,
    firstOpen: true,
  }

  // ─── localStorage ─────────────────────────────────────────────────────────

  function readPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed.version !== STORAGE_VERSION || !parsed.status) return null
      return parsed
    } catch {
      return null
    }
  }

  function persistState(status, code) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        status,
        code: code || null,
        updatedAt: new Date().toISOString(),
      }))
    } catch {
      // localStorage unavailable in some private browsing modes
    }
  }

  // ─── Validation ───────────────────────────────────────────────────────────

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  }

  function isValidPhone(v) {
    const stripped = v.replace(/[\s\-()]/g, '')
    if (stripped.startsWith('+')) return /^\+[1-9]\d{8,14}$/.test(stripped)
    if (stripped.startsWith('0')) return /^0\d{8,14}$/.test(stripped)
    return /^\d{9,15}$/.test(stripped)
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  async function submitDiscountLead(payload) {
    // TODO(backend): swap for a direct CRM webhook (Brevo / Mailchimp / HubSpot)
    // once an email-marketing provider is chosen, or persist to Supabase `leads`.
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, payload, { source: 'landing-popup' })),
      })
      if (!res.ok) throw new Error('lead_save_failed_' + res.status)
      return { ok: true }
    } catch (err) {
      console.error('[discount-popup] submit failed', err)
      // Code is still granted even when persistence fails — the user must not
      // be penalised for a backend hiccup.
      return { ok: true, warning: 'persist_failed' }
    }
  }

  // ─── Clipboard ────────────────────────────────────────────────────────────

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try { document.execCommand('copy') } catch {}
    document.body.removeChild(ta)
    return Promise.resolve()
  }

  // ─── Body scroll lock ─────────────────────────────────────────────────────

  function lockScroll() {
    if (!document.body.dataset.mhDiscountOverflow) {
      document.body.dataset.mhDiscountOverflow = document.body.style.overflow || ''
    }
    document.body.style.overflow = 'hidden'
  }

  function unlockScroll() {
    if ('mhDiscountOverflow' in document.body.dataset) {
      document.body.style.overflow = document.body.dataset.mhDiscountOverflow
      delete document.body.dataset.mhDiscountOverflow
    }
  }

  // ─── Styles ───────────────────────────────────────────────────────────────

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 999999;
        pointer-events: none;
        font-family: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #${ROOT_ID} * { box-sizing: border-box; }

      .mh-dp__backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.42);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.22s ease;
      }
      .mh-dp__backdrop.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .mh-dp__wrap {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        pointer-events: none;
      }

      .mh-dp__card {
        position: relative;
        width: min(440px, calc(100vw - 32px));
        max-height: calc(100vh - 32px);
        overflow-y: auto;
        background: #ffffff;
        border: 1px solid #E2E8F0;
        border-radius: 24px;
        box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28), 0 4px 12px rgba(15, 23, 42, 0.08);
        padding: 28px;
        pointer-events: auto;
        opacity: 0;
        transform: scale(0.94) translateY(10px);
        transition: opacity 0.25s cubic-bezier(0.21, 0.47, 0.32, 0.98),
                    transform 0.25s cubic-bezier(0.21, 0.47, 0.32, 0.98);
      }
      .mh-dp__card.is-open {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .mh-dp__card.no-anim {
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .mh-dp__card { transition: opacity 0.18s ease; transform: none !important; }
      }

      .mh-dp__close {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: 0;
        background: #F8FAFC;
        color: #64748B;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.14s ease, color 0.14s ease;
        padding: 0;
      }
      .mh-dp__close:hover { background: #EFF3F8; color: #1B2845; }

      .mh-dp__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 14px;
        background: #EBF3FB;
        color: #335C81;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .mh-dp__title {
        margin: 0 0 8px;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #1B2845;
        line-height: 1.25;
      }

      .mh-dp__sub {
        margin: 0 0 20px;
        font-size: 14px;
        color: #475569;
        line-height: 1.65;
      }

      .mh-dp__visually-hidden {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }

      .mh-dp__input {
        display: block;
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        font-size: 14px;
        color: #1B2845;
        background: #fff;
        outline: none;
        font-family: inherit;
        transition: border-color 0.14s ease, box-shadow 0.14s ease;
        -webkit-appearance: none;
        appearance: none;
        margin-bottom: 0;
      }
      .mh-dp__input::placeholder { color: #94A3B8; }
      .mh-dp__input:focus {
        border-color: #5899E2;
        box-shadow: 0 0 0 3px rgba(88, 153, 226, 0.18);
      }
      .mh-dp__input.has-error { border-color: #DC2626; }

      .mh-dp__error {
        margin: 6px 0 0;
        font-size: 12.5px;
        color: #DC2626;
        min-height: 18px;
        line-height: 1.4;
      }

      .mh-dp__disclaimer {
        margin: 8px 0 0;
        font-size: 11.5px;
        color: #94A3B8;
        text-align: center;
      }

      .mh-dp__btn-primary {
        display: block;
        width: 100%;
        margin-top: 14px;
        padding: 13px 20px;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #5899E2 0%, #335C81 100%);
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        font-family: inherit;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(27, 79, 216, 0.25);
        transition: opacity 0.14s ease, transform 0.14s ease;
        line-height: 1;
        -webkit-appearance: none;
        appearance: none;
      }
      .mh-dp__btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
      .mh-dp__btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

      .mh-dp__btn-ghost {
        display: block;
        width: 100%;
        margin-top: 10px;
        padding: 11px 20px;
        border: 1px solid #E2E8F0;
        border-radius: 999px;
        background: transparent;
        color: #64748B;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.14s ease, color 0.14s ease;
        line-height: 1;
        -webkit-appearance: none;
        appearance: none;
      }
      .mh-dp__btn-ghost:hover { background: #F8FAFC; color: #1B2845; }

      .mh-dp__divider {
        border: 0;
        border-top: 1px solid #E2E8F0;
        margin: 22px 0;
      }

      .mh-dp__code-label {
        font-size: 12px;
        font-weight: 700;
        color: #64748B;
        letter-spacing: 0.04em;
        margin: 0 0 8px;
        text-transform: uppercase;
      }

      .mh-dp__code-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: #F0F6FC;
        border: 1.5px dashed #C5DDF1;
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 0;
      }

      .mh-dp__code-value {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #1B2845;
        user-select: all;
        -webkit-user-select: all;
      }

      .mh-dp__copy-btn {
        flex-shrink: 0;
        padding: 7px 14px;
        border: 1px solid #C5DDF1;
        border-radius: 8px;
        background: #fff;
        color: #335C81;
        font-size: 12.5px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
        white-space: nowrap;
        -webkit-appearance: none;
        appearance: none;
      }
      .mh-dp__copy-btn:hover { background: #E0EDF8; border-color: #9AC2E8; }
      .mh-dp__copy-btn.copied { background: #ECFDF5; border-color: #86EFAC; color: #059669; }

      .mh-dp__success-badge {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 16px;
        font-size: 13px;
        font-weight: 700;
        color: #059669;
      }
      .mh-dp__success-badge-icon {
        width: 20px;
        height: 20px;
        border-radius: 999px;
        background: #ECFDF5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        flex-shrink: 0;
      }

      .mh-dp__upsell-title {
        margin: 0 0 6px;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #1B2845;
      }
      .mh-dp__upsell-sub {
        margin: 0 0 16px;
        font-size: 13.5px;
        color: #475569;
        line-height: 1.6;
      }

      @media (max-width: 480px) {
        .mh-dp__card { padding: 22px 18px; border-radius: 20px; }
        .mh-dp__title { font-size: 19px; }
        .mh-dp__code-value { font-size: 17px; }
        .mh-dp__code-chip { flex-wrap: wrap; }
        .mh-dp__copy-btn { width: 100%; margin-top: 8px; text-align: center; }
      }
    `
    document.head.appendChild(style)
  }

  // ─── Root node ────────────────────────────────────────────────────────────

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID)
    if (!root) {
      root = document.createElement('div')
      root.id = ROOT_ID
      document.body.appendChild(root)
    }
    return root
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function renderCodeBlock(code) {
    return `
      <p class="mh-dp__code-label">Твоят код за отстъпка:</p>
      <div class="mh-dp__code-chip">
        <span class="mh-dp__code-value">${escHtml(code)}</span>
        <button
          type="button"
          class="mh-dp__copy-btn${state.copied ? ' copied' : ''}"
          data-dp-action="copy"
          data-dp-code="${escHtml(code)}"
          aria-label="Копирай кода"
        >${state.copied ? 'Копирано ✓' : 'Копирай'}</button>
      </div>
    `
  }

  // ─── Step renderers ───────────────────────────────────────────────────────

  function renderEmailStep() {
    return `
      <span class="mh-dp__eyebrow">🎁 Само за нови потребители</span>
      <h2 id="mh-dp-title" class="mh-dp__title">Вземи 10% отстъпка</h2>
      <p class="mh-dp__sub">Остави имейл и получи код за абонамента си.</p>
      <label class="mh-dp__visually-hidden" for="mh-dp-email">Имейл адрес</label>
      <input
        id="mh-dp-email"
        class="mh-dp__input${state.emailError ? ' has-error' : ''}"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="Твоят имейл"
        value="${escHtml(state.email)}"
        ${state.submitting ? 'disabled' : ''}
        data-dp-field="email"
      />
      <p class="mh-dp__error"${state.emailError ? ' role="alert"' : ''}>${state.emailError ? escHtml(state.emailError) : ''}</p>
      <p class="mh-dp__disclaimer">Кодът се прилага в чекаута. Без спам.</p>
      <button
        type="button"
        class="mh-dp__btn-primary"
        data-dp-action="submit-email"
        ${state.submitting ? 'disabled' : ''}
      >${state.submitting ? 'Зареждане…' : 'Вземи кода'}</button>
    `
  }

  function renderSuccess10PhoneStep() {
    return `
      <div class="mh-dp__success-badge">
        <span class="mh-dp__success-badge-icon" aria-hidden="true">✓</span>
        Кодът ти е готов!
      </div>
      ${renderCodeBlock(CODE_10)}
      <hr class="mh-dp__divider" />
      <p class="mh-dp__upsell-title">Отключи 15% отстъпка</p>
      <p class="mh-dp__upsell-sub">Добави телефон и вземи по-голяма отстъпка.</p>
      <label class="mh-dp__visually-hidden" for="mh-dp-phone">Телефонен номер</label>
      <input
        id="mh-dp-phone"
        class="mh-dp__input${state.phoneError ? ' has-error' : ''}"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="Телефонен номер"
        value="${escHtml(state.phone)}"
        ${state.submitting ? 'disabled' : ''}
        data-dp-field="phone"
      />
      <p class="mh-dp__error"${state.phoneError ? ' role="alert"' : ''}>${state.phoneError ? escHtml(state.phoneError) : ''}</p>
      <button
        type="button"
        class="mh-dp__btn-primary"
        data-dp-action="submit-phone"
        ${state.submitting ? 'disabled' : ''}
      >${state.submitting ? 'Зареждане…' : 'Отключи 15%'}</button>
      <button
        type="button"
        class="mh-dp__btn-ghost"
        data-dp-action="skip-phone"
      >Не, благодаря</button>
    `
  }

  function renderSuccess10DoneStep() {
    return `
      <div class="mh-dp__success-badge">
        <span class="mh-dp__success-badge-icon" aria-hidden="true">✓</span>
        Кодът ти е готов!
      </div>
      ${renderCodeBlock(CODE_10)}
      <button
        type="button"
        class="mh-dp__btn-ghost"
        style="margin-top: 18px;"
        data-dp-action="close"
      >Готово</button>
    `
  }

  function renderSuccess15Step() {
    return `
      <div class="mh-dp__success-badge">
        <span class="mh-dp__success-badge-icon" aria-hidden="true">✓</span>
        Отключи 15% отстъпка!
      </div>
      ${renderCodeBlock(CODE_15)}
      <button
        type="button"
        class="mh-dp__btn-ghost"
        style="margin-top: 18px;"
        data-dp-action="close"
      >Готово</button>
    `
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  function render() {
    const root = document.getElementById(ROOT_ID)
    if (!root) return

    if (!state.open) {
      root.innerHTML = ''
      return
    }

    let cardContent = ''
    switch (state.step) {
      case 'email':          cardContent = renderEmailStep();          break
      case 'success10phone': cardContent = renderSuccess10PhoneStep(); break
      case 'success10done':  cardContent = renderSuccess10DoneStep();  break
      case 'success15':      cardContent = renderSuccess15Step();      break
      default: root.innerHTML = ''; return
    }

    const isFirstOpen = state.firstOpen
    if (isFirstOpen) state.firstOpen = false

    root.innerHTML = `
      <div class="mh-dp__backdrop" data-dp-action="backdrop-close"></div>
      <div class="mh-dp__wrap">
        <div
          class="mh-dp__card${isFirstOpen ? '' : ' no-anim'}"
          role="dialog"
          aria-modal="true"
          aria-label="Отстъпка за нови потребители"
        >
          <button
            type="button"
            class="mh-dp__close"
            data-dp-action="close"
            aria-label="Затвори"
          >×</button>
          ${cardContent}
        </div>
      </div>
    `

    // Trigger open animation on first render only via rAF
    requestAnimationFrame(() => {
      const backdrop = root.querySelector('.mh-dp__backdrop')
      const card = root.querySelector('.mh-dp__card')
      if (backdrop) backdrop.classList.add('is-open')
      if (card) card.classList.add('is-open')
    })

    // Move focus into the active input
    requestAnimationFrame(() => {
      const focusId = state.step === 'email' ? 'mh-dp-email'
                    : state.step === 'success10phone' ? 'mh-dp-phone'
                    : null
      if (focusId) {
        const el = document.getElementById(focusId)
        if (el) el.focus()
      }
    })
  }

  // ─── Open / close ─────────────────────────────────────────────────────────

  function openPopup() {
    state.open = true
    state.step = 'email'
    lockScroll()
    render()
  }

  function closePopup() {
    const isOnSuccess = state.step === 'success10phone'
                     || state.step === 'success10done'
                     || state.step === 'success15'

    if (!isOnSuccess) {
      persistState('dismissed', null)
    }
    // success steps are already persisted at the point the user reaches them

    state.open = false
    state.copied = false
    unlockScroll()
    render()
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  function handleClick(event) {
    const target = event.target
    if (!(target instanceof Element)) return

    const actionEl = target.closest('[data-dp-action]')
    if (!(actionEl instanceof HTMLElement)) return

    const action = actionEl.getAttribute('data-dp-action')

    if (action === 'close' || action === 'backdrop-close') {
      closePopup()
      return
    }
    if (action === 'submit-email') {
      handleEmailSubmit()
      return
    }
    if (action === 'submit-phone') {
      handlePhoneSubmit()
      return
    }
    if (action === 'skip-phone') {
      persistState('email_submitted', CODE_10)
      state.step = 'success10done'
      state.copied = false
      render()
      return
    }
    if (action === 'copy') {
      const code = actionEl.getAttribute('data-dp-code') || ''
      copyToClipboard(code).then(() => {
        state.copied = true
        render()
        setTimeout(() => {
          state.copied = false
          render()
        }, 2200)
      })
      return
    }
  }

  function handleInput(event) {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) return
    const field = target.getAttribute('data-dp-field')
    if (field === 'email') {
      state.email = target.value
      if (state.emailError) {
        state.emailError = ''
        target.classList.remove('has-error')
        const errEl = target.nextElementSibling
        if (errEl) { errEl.textContent = ''; errEl.removeAttribute('role') }
      }
    }
    if (field === 'phone') {
      state.phone = target.value
      if (state.phoneError) {
        state.phoneError = ''
        target.classList.remove('has-error')
        const errEl = target.nextElementSibling
        if (errEl) { errEl.textContent = ''; errEl.removeAttribute('role') }
      }
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && state.open) {
      closePopup()
      return
    }
    if (event.key === 'Enter') {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      const field = target.getAttribute('data-dp-field')
      if (field === 'email') { event.preventDefault(); handleEmailSubmit() }
      if (field === 'phone') { event.preventDefault(); handlePhoneSubmit() }
    }
  }

  // ─── Form submit logic ────────────────────────────────────────────────────

  async function handleEmailSubmit() {
    // Read from DOM in case autofill bypassed the input event
    const inputEl = document.getElementById('mh-dp-email')
    const email = (inputEl instanceof HTMLInputElement ? inputEl.value : state.email).trim()
    state.email = email

    if (!isValidEmail(email)) {
      state.emailError = 'Моля, въведи валиден имейл адрес.'
      render()
      return
    }

    state.emailError = ''
    state.submitting = true
    render()
    await submitDiscountLead({ email })
    state.submitting = false
    state.step = 'success10phone'
    state.copied = false
    render()
  }

  async function handlePhoneSubmit() {
    const inputEl = document.getElementById('mh-dp-phone')
    const phone = (inputEl instanceof HTMLInputElement ? inputEl.value : state.phone).trim()
    state.phone = phone

    if (!isValidPhone(phone)) {
      state.phoneError = 'Моля, въведи валиден телефонен номер.'
      render()
      return
    }

    state.phoneError = ''
    state.submitting = true
    render()
    await submitDiscountLead({ email: state.email, phone })
    state.submitting = false
    persistState('phone_submitted', CODE_15)
    state.step = 'success15'
    state.copied = false
    render()
  }

  // ─── Cookie consent integration ───────────────────────────────────────────

  function hasCookieConsent() {
    return document.cookie.split('; ').some(c => c.startsWith('mh_cookie_consent='))
  }

  function scheduleShow() {
    if (hasCookieConsent()) {
      setTimeout(openPopup, SHOW_DELAY_MS)
    } else {
      // Wait for the user to dismiss the cookie banner, then show the popup.
      // cookie-consent.js dispatches 'mh-cookie-consent:change' on cookie-consent.js:83.
      document.addEventListener('mh-cookie-consent:change', function onConsent() {
        document.removeEventListener('mh-cookie-consent:change', onConsent)
        setTimeout(openPopup, POST_CONSENT_DELAY_MS)
      })
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    const persisted = readPersistedState()
    if (persisted && persisted.status) return // One-shot: already seen on this device

    ensureStyles()
    ensureRoot()

    document.addEventListener('click', handleClick)
    document.addEventListener('input', handleInput)
    document.addEventListener('keydown', handleKeydown)

    scheduleShow()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
