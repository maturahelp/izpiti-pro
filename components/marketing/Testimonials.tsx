export function Testimonials() {
  return (
    <section className="py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>
            Какво казват ученици и родители
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Виж реални мнения за MaturaHelp и защо платформата помага за по-уверена подготовка за НВО и ДЗИ.
          </p>
        </div>
        <div
          className="trustpilot-widget"
          data-locale="bg-BG"
          data-template-id="56278e9abfbbba0bdcd568bc"
          data-businessunit-id="yWn0s75ZBbjHmjQ1"
          data-style-height="52px"
          data-style-width="100%"
        >
          <a href="https://bg.trustpilot.com/review/maturahelp.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
            Разгледай отзивите ни в Trustpilot
          </a>
        </div>
      </div>
    </section>
  )
}
