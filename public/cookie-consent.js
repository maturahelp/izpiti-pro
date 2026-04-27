(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.__mhCookieConsentInitialized) return
  window.__mhCookieConsentInitialized = true

  const COOKIE_NAME = 'mh_cookie_consent'
  const COOKIE_VERSION = '2026-04-25'
  const COOKIE_ATTRIBUTES = 'Max-Age=15552000; Path=/; SameSite=Lax'
  const ROOT_ID = 'mh-cookie-consent-root'
  const STYLE_ID = 'mh-cookie-consent-style'

  const state = {
    consent: null,
    draft: null,
    panelOpen: false,
  }

  function createDefaultConsent() {
    return {
      version: COOKIE_VERSION,
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: '',
    }
  }

  function createAcceptAllConsent() {
    return {
      version: COOKIE_VERSION,
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    }
  }

  function serializeConsent(consent) {
    return encodeURIComponent(JSON.stringify(consent))
  }

  function parseConsent(raw) {
    if (!raw) return null

    try {
      const parsed = JSON.parse(decodeURIComponent(raw))

      if (
        parsed.version !== COOKIE_VERSION ||
        parsed.essential !== true ||
        typeof parsed.analytics !== 'boolean' ||
        typeof parsed.marketing !== 'boolean' ||
        typeof parsed.updatedAt !== 'string'
      ) {
        return null
      }

      return {
        version: parsed.version,
        essential: true,
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        updatedAt: parsed.updatedAt,
      }
    } catch {
      return null
    }
  }

  function readCookie(name) {
    const prefix = `${name}=`
    const match = document.cookie.split('; ').find((entry) => entry.startsWith(prefix))
    return match ? match.slice(prefix.length) : null
  }

  function writeConsent(consent) {
    document.cookie = `${COOKIE_NAME}=${serializeConsent(consent)}; ${COOKIE_ATTRIBUTES}`
    state.consent = consent
    state.draft = { ...consent }
    state.panelOpen = false
    syncBodyScroll()
    render()
    document.dispatchEvent(new CustomEvent('mh-cookie-consent:change', { detail: consent }))
  }

  function openPreferences() {
    state.panelOpen = true
    state.draft = state.consent ? { ...state.consent } : createDefaultConsent()
    syncBodyScroll()
    render()
  }

  function closePreferences() {
    state.panelOpen = false
    syncBodyScroll()
    render()
  }

  function saveDraft() {
    const nextConsent = {
      version: COOKIE_VERSION,
      essential: true,
      analytics: Boolean(state.draft && state.draft.analytics),
      marketing: Boolean(state.draft && state.draft.marketing),
      updatedAt: new Date().toISOString(),
    }

    writeConsent(nextConsent)
  }

  function acceptAll() {
    writeConsent(createAcceptAllConsent())
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        pointer-events: none;
      }

      #${ROOT_ID} * {
        box-sizing: border-box;
        font-family: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .mh-cookie-consent__backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease;
      }

      .mh-cookie-consent__backdrop.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .mh-cookie-consent__banner {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: 16px;
        max-width: 980px;
        margin: 0 auto;
        display: none;
        pointer-events: auto;
        background: rgba(6, 13, 31, 0.96);
        color: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.32);
        padding: 16px;
      }

      .mh-cookie-consent__banner.is-visible {
        display: block;
      }

      .mh-cookie-consent__banner-grid {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
      }

      .mh-cookie-consent__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #93c5fd;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .mh-cookie-consent__copy {
        max-width: 640px;
      }

      .mh-cookie-consent__title {
        margin: 0 0 6px;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }

      .mh-cookie-consent__text {
        margin: 0;
        color: rgba(226, 232, 240, 0.86);
        font-size: 13px;
        line-height: 1.65;
      }

      .mh-cookie-consent__link {
        color: #93c5fd;
        font-weight: 700;
        text-decoration: none;
      }

      .mh-cookie-consent__link:hover {
        text-decoration: underline;
      }

      .mh-cookie-consent__actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      .mh-cookie-consent__button {
        appearance: none;
        border: 0;
        cursor: pointer;
        border-radius: 999px;
        padding: 11px 16px;
        font-size: 13px;
        font-weight: 800;
        line-height: 1;
        transition: transform 0.14s ease, background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
      }

      .mh-cookie-consent__button:hover {
        transform: translateY(-1px);
      }

      .mh-cookie-consent__button--secondary {
        background: transparent;
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.32);
      }

      .mh-cookie-consent__button--secondary:hover {
        background: rgba(148, 163, 184, 0.12);
      }

      .mh-cookie-consent__button--primary {
        background: linear-gradient(135deg, #5899e2 0%, #335c81 100%);
        color: #ffffff;
      }

      .mh-cookie-consent__panel {
        position: fixed;
        left: 50%;
        top: 50%;
        width: min(460px, calc(100vw - 32px));
        max-height: calc(100vh - 32px);
        transform: translate(-50%, calc(-50% + 18px));
        opacity: 0;
        pointer-events: none;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 24px;
        box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
        overflow: auto;
      }

      .mh-cookie-consent__panel.is-open {
        opacity: 1;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease, opacity 0.2s ease;
      }

      .mh-cookie-consent__panel-inner {
        padding: 22px;
      }

      .mh-cookie-consent__panel-title {
        margin: 0;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }

      .mh-cookie-consent__panel-copy {
        margin: 10px 0 0;
        color: #475569;
        font-size: 14px;
        line-height: 1.65;
      }

      .mh-cookie-consent__section {
        margin-top: 18px;
        display: grid;
        gap: 12px;
      }

      .mh-cookie-consent__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 14px;
        background: #f8fafc;
      }

      .mh-cookie-consent__row-title {
        display: block;
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }

      .mh-cookie-consent__row-text {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        line-height: 1.6;
        color: #64748b;
      }

      .mh-cookie-consent__toggle {
        min-width: 88px;
        justify-content: center;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border-radius: 999px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #0f172a;
        cursor: pointer;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
      }

      .mh-cookie-consent__toggle::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #94a3b8;
      }

      .mh-cookie-consent__toggle.is-on {
        border-color: rgba(88, 153, 226, 0.35);
        background: #eff6ff;
        color: #1d4ed8;
      }

      .mh-cookie-consent__toggle.is-on::before {
        background: #2563eb;
      }

      .mh-cookie-consent__toggle[disabled] {
        cursor: default;
        background: #dbeafe;
        color: #1d4ed8;
        border-color: rgba(88, 153, 226, 0.26);
      }

      .mh-cookie-consent__toggle[disabled]::before {
        background: #2563eb;
      }

      .mh-cookie-consent__panel-actions {
        margin-top: 18px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .mh-cookie-consent__close {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 0;
        background: #f1f5f9;
        color: #334155;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
      }

      @media (max-width: 640px) {
        .mh-cookie-consent__banner-grid {
          flex-direction: column;
          align-items: stretch;
        }

        .mh-cookie-consent__actions {
          width: 100%;
          justify-content: stretch;
        }

        .mh-cookie-consent__button {
          flex: 1 1 0;
          justify-content: center;
        }

        .mh-cookie-consent__panel {
          max-height: calc(100vh - 16px);
        }

        .mh-cookie-consent__panel-actions {
          flex-direction: column-reverse;
        }

        .mh-cookie-consent__panel-actions .mh-cookie-consent__button {
          width: 100%;
        }
      }
    `

    document.head.appendChild(style)
  }

  function renderCategoryRow(title, description, key, locked) {
    const isOn = locked ? true : Boolean(state.draft && state.draft[key])

    return `
      <div class="mh-cookie-consent__row">
        <div>
          <span class="mh-cookie-consent__row-title">${title}</span>
          <span class="mh-cookie-consent__row-text">${description}</span>
        </div>
        <button
          type="button"
          class="mh-cookie-consent__toggle${isOn ? ' is-on' : ''}"
          data-consent-toggle="${key}"
          role="switch"
          aria-checked="${isOn ? 'true' : 'false'}"
          ${locked ? 'disabled aria-disabled="true"' : ''}
        >
          ${isOn ? 'Вкл.' : 'Изкл.'}
        </button>
      </div>
    `
  }

  function syncBodyScroll() {
    if (state.panelOpen) {
      if (!document.body.dataset.mhCookieConsentOverflow) {
        document.body.dataset.mhCookieConsentOverflow = document.body.style.overflow || ''
      }
      document.body.style.overflow = 'hidden'
      return
    }

    if ('mhCookieConsentOverflow' in document.body.dataset) {
      document.body.style.overflow = document.body.dataset.mhCookieConsentOverflow
      delete document.body.dataset.mhCookieConsentOverflow
    }
  }

  function render() {
    const root = document.getElementById(ROOT_ID)
    if (!root) return

    const showBanner = !state.consent && !state.panelOpen

    root.innerHTML = `
      <div class="mh-cookie-consent__backdrop${state.panelOpen ? ' is-open' : ''}" data-consent-action="close"></div>
      <section class="mh-cookie-consent__panel${state.panelOpen ? ' is-open' : ''}" aria-hidden="${state.panelOpen ? 'false' : 'true'}" role="dialog" aria-modal="true" aria-labelledby="mh-cookie-consent-title">
        <div class="mh-cookie-consent__panel-inner">
          <button type="button" class="mh-cookie-consent__close" aria-label="Затвори настройките за бисквитки" data-consent-action="close">×</button>
          <h2 id="mh-cookie-consent-title" class="mh-cookie-consent__panel-title">Настройки за бисквитки</h2>
          <p class="mh-cookie-consent__panel-copy">
            Управлявай кои допълнителни бисквитки да активираме. Задължителните бисквитки са нужни за работата на сайта.
            <a href="/cookies" class="mh-cookie-consent__link">Политика за бисквитки</a>
          </p>
          <div class="mh-cookie-consent__section">
            ${renderCategoryRow('Задължителни', 'Нужни за сигурност, вход и основна работа на платформата.', 'essential', true)}
            ${renderCategoryRow('Аналитични', 'Помагат ни да разбираме кои страници и функции се използват най-много.', 'analytics', false)}
            ${renderCategoryRow('Маркетингови', 'Използват се за кампании, ремаркетинг и измерване на маркетинг ефекта.', 'marketing', false)}
          </div>
          <div class="mh-cookie-consent__panel-actions">
            <button type="button" class="mh-cookie-consent__button mh-cookie-consent__button--secondary" data-consent-action="close">Затвори</button>
            <button type="button" class="mh-cookie-consent__button mh-cookie-consent__button--primary" data-consent-action="save">Запази избора</button>
          </div>
        </div>
      </section>
      <section class="mh-cookie-consent__banner${showBanner ? ' is-visible' : ''}" aria-hidden="${showBanner ? 'false' : 'true'}">
        <div class="mh-cookie-consent__banner-grid">
          <div class="mh-cookie-consent__copy">
            <div class="mh-cookie-consent__eyebrow">Бисквитки</div>
            <h2 class="mh-cookie-consent__title">Използваме бисквитки за по-добро изживяване</h2>
            <p class="mh-cookie-consent__text">
              Задължителните бисквитки поддържат входа и сигурността. Аналитичните и маркетинговите бисквитки се включват само след твой избор.
              <a href="/cookies" class="mh-cookie-consent__link">Научи повече</a>
            </p>
          </div>
          <div class="mh-cookie-consent__actions">
            <button type="button" class="mh-cookie-consent__button mh-cookie-consent__button--secondary" data-consent-action="manage">Настройки</button>
            <button type="button" class="mh-cookie-consent__button mh-cookie-consent__button--primary" data-consent-action="accept">Приеми</button>
          </div>
        </div>
      </section>
    `
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID)
    if (!root) {
      root = document.createElement('div')
      root.id = ROOT_ID
      document.body.appendChild(root)
    }

    return root
  }

  function handleClick(event) {
    const target = event.target
    if (!(target instanceof Element)) return

    const settingsTrigger = target.closest('[data-cookie-settings-trigger]')
    if (settingsTrigger) {
      event.preventDefault()
      openPreferences()
      return
    }

    const toggle = target.closest('[data-consent-toggle]')
    if (toggle instanceof HTMLButtonElement && !toggle.disabled) {
      const key = toggle.getAttribute('data-consent-toggle')
      if (key !== 'analytics' && key !== 'marketing') return

      state.draft = state.draft || createDefaultConsent()
      state.draft[key] = !state.draft[key]
      render()
      return
    }

    const action = target.closest('[data-consent-action]')
    if (!(action instanceof HTMLElement)) return

    const actionName = action.getAttribute('data-consent-action')
    if (actionName === 'manage') {
      openPreferences()
      return
    }

    if (actionName === 'accept') {
      acceptAll()
      return
    }

    if (actionName === 'save') {
      saveDraft()
      return
    }

    if (actionName === 'close') {
      closePreferences()
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && state.panelOpen) {
      closePreferences()
    }
  }

  function init() {
    ensureStyles()
    ensureRoot()
    state.consent = parseConsent(readCookie(COOKIE_NAME))
    state.draft = state.consent ? { ...state.consent } : createDefaultConsent()
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeydown)
    render()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
