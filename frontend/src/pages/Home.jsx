import { Link } from 'react-router-dom'
import { formatNaira } from '../lib/format.js'

const STEPS = [
  ['Send your problem to a shop', 'Pick a verified shop, choose your vehicle and describe what is wrong.'],
  ['Get an itemised quote', 'See parts, labour and time. Once you accept, the price is locked.'],
  ['Approve extras as they come up', 'If the mechanic finds more work, they must ask first. You see the reason and the cost, then approve or decline.'],
]

// A picture of the Approval Lock, the idea Kaza is built around.
function ApprovalPreview() {
  return (
    <div
      role="img"
      aria-label={`Example: a locked quote of ${formatNaira(6850000)} for brake pads and labour, and a pending extra-work request of ${formatNaira(2400000)} waiting for the owner's approval.`}
      className="card overflow-hidden border-t-8 border-t-danfo shadow-sm"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">Brake pads and labour</p>
            <p className="text-sm text-ink-soft">Quote accepted by the owner</p>
          </div>
          <p className="font-display text-xl font-extrabold">{formatNaira(6850000)}</p>
        </div>
        <p className="mt-2 inline-block rounded-full bg-verified/10 px-2 py-0.5 text-sm font-semibold text-verified">Price locked</p>
      </div>
      <div className="border-t border-dashed border-line bg-road/60 p-5">
        <p className="text-sm font-semibold text-alert">Extra work found</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <p>Rear brake disc is warped and needs replacing.</p>
          <p className="font-display text-xl font-extrabold">+{formatNaira(2400000)}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-md border border-ink/30 bg-white px-3 py-1.5 text-sm font-semibold">Decline</span>
          <span className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white">Approve</span>
        </div>
        <p className="mt-3 text-sm text-ink-soft">The shop cannot continue this item until you approve.</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-20">
        <div>
          <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Know the price before the work starts.</h1>
          <p className="mt-5 max-w-prose text-lg text-ink-soft">
            Kaza connects vehicle owners across Nigeria with verified mechanics. Every quote is itemised, and once you
            accept it, any extra work needs your approval first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shops" className="btn btn-primary">Find a verified shop</Link>
            <Link to="/register?role=shop" className="btn btn-secondary">List your shop</Link>
          </div>
        </div>
        <ApprovalPreview />
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl sm:text-3xl">How a repair works on Kaza</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="font-display text-4xl font-extrabold text-ink/30" aria-hidden="true">{i + 1}</span>
                <h3 className="mt-1 text-xl">{title}</h3>
                <p className="mt-2 max-w-prose text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
