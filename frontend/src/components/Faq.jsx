const QUESTIONS = [
  {
    q: 'Is rescued food safe to eat?',
    a: 'Yes. Businesses only list food that is still good: fresh bakes at the end of the day, meals made today, produce that is perfectly fine but will not sell. Each listing says what is inside and notes allergens and dietary details, so you know before you collect.',
  },
  {
    q: 'How does pickup work?',
    a: 'Every listing has a pickup window and a countdown. Reserve before the clock reaches zero, go to the business during the window, and show your pickup code at the counter.',
  },
  {
    q: 'What if I am running late?',
    a: 'Pickup windows are short on purpose, because the food needs to go home that evening. If you cannot make it, cancel so someone else can have it. Cancelling early is always kinder than not showing up.',
  },
  {
    q: 'Why would a business do this?',
    a: 'Throwing food away costs money twice: once to make it, and again to dispose of it. A rescue recovers part of that cost, brings in new customers, and lets the team feel good about closing time.',
  },
  {
    q: 'What is in the bag?',
    a: 'Each listing tells you what to expect. Some are exact (two sourdough loaves) and some are surprises within a type (a veg box). The photo shows the kind of food, and the description lists what is inside.',
  },
]

export default function Faq() {
  return (
    <section className="page faq" aria-labelledby="faq-title">
      <div className="panel faq__panel">
        <h2 id="faq-title">Good questions</h2>
        <div className="faq__list">
          {QUESTIONS.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
