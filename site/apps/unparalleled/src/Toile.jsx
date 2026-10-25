// The muslin: a generic landing page as an agent ships it by default, re-cut one correction
// at a time. `step` is how many of the six corrections have been applied (0 to 6).
// The template tells inside are deliberate; this block is the specimen the page dissects.

function Mark({ n, step, children, className = '', as: Tag = 'div' }) {
  const state = step >= n ? 'done' : step === n - 1 ? 'next' : 'pending';
  return (
    <Tag className={`toile__mark ${className}`} data-mark={state}>
      {children}
      <span className="toile__chalk" aria-hidden="true"><span>{n}</span></span>
    </Tag>
  );
}

export default function Toile({ step = 0, label }) {
  const s = (n) => step >= n;
  return (
    <div className="toile" role="img" aria-label={label}>
      <div className={`toile__page ${s(2) ? 'is-serif' : ''} ${s(6) ? 'is-studio' : ''}`}>
        <div className="toile__backdrop" aria-hidden="true" />
        <div className="toile__nav">
          <span className="toile__logo">Poterie Celeste</span>
          <span className="toile__links"><span>Shop</span><span>About</span><span>Journal</span></span>
          <Mark n={4} step={step} className="toile__navcta"><span className={s(4) ? 'toile__btn toile__btn--square' : 'toile__btn toile__btn--pill'}>{s(4) ? 'Commission' : 'Get started'}</span></Mark>
        </div>

        <div className="toile__hero">
          <Mark n={1} step={step} className={`toile__eyebrow ${s(1) ? 'is-cut' : ''}`}>
            <span className="toile__dot" />NOW SHIPPING · COLLECTION 2.0
          </Mark>
          <Mark n={3} step={step} className="toile__headline" as="div">
            <span className="toile__h">{s(3) ? 'Vessels made once.' : 'Elevate your space with artisanal ceramics'}</span>
          </Mark>
          <p className="toile__p">{s(3)
            ? 'Thrown, fired and offered one at a time in the atelier of Christie Wallace.'
            : 'Discover timeless, handcrafted pieces designed to transform every corner of your home into a sanctuary.'}</p>
          <Mark n={4} step={step} className="toile__actions">
            {s(4)
              ? <><span className="toile__btn toile__btn--square">Walk the collections</span><span className="toile__textlink">Commission a piece</span></>
              : <><span className="toile__btn toile__btn--pill">Shop now</span><span className="toile__btn toile__btn--ghost">Learn more</span></>}
          </Mark>
          <Mark n={2} step={step} className="toile__typemark"><span>{s(2) ? 'Brygada 1918' : 'Inter, 16px'}</span></Mark>
        </div>

        <Mark n={5} step={step} className={`toile__below ${s(6) ? 'is-gone' : ''}`}>
          {s(5)
            ? <img className="toile__photo" src="/demos/poterie-studio-still.webp" alt="" width="960" height="540" />
            : (
              <div className="toile__cards">
                {['Handcrafted', 'Free shipping', 'Sustainable'].map((t) => (
                  <div className="toile__card" key={t}><span className="toile__icon" /><b>{t}</b><span>Quality you can feel in every piece we make.</span></div>
                ))}
              </div>
            )}
        </Mark>
        <Mark n={6} step={step} className="toile__frame-mark"><span /></Mark>
      </div>
    </div>
  );
}
