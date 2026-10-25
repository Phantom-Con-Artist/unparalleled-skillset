import { Link } from 'react-router-dom';
import Img from '../components/Img.jsx';
import { BASILISK_FACTS, COMPANY } from '../data.js';

export default function Basilisk() {
  return (
    <>
      <section className="page-hero page-hero--dark" data-surface="dark" aria-labelledby="h-b2">
        <div className="page-hero__text">
          <p className="kicker"><span className="mono">10 mK</span> Processor</p>
          <h1 id="h-b2" className="display">Basilisk 2</h1>
          <p className="lede">Our second superconducting quantum processor: transmon qubits on a ten-millimetre silicon die, wire-bonded into a gold-plated copper package and cooled below the mixing chamber of a dilution refrigerator.</p>
        </div>
        <figure className="page-hero__image">
          <Img name="basilisk-2-processor-hero" alt="Basilisk 2 in its gold-plated copper package, lid removed, SMA connectors at either end and the name engraved on the rim." sizes="(min-width: 960px) 58vw, 100vw" loading="eager" fetchPriority="high" />
        </figure>
      </section>

      <section className="publish" aria-labelledby="h-publish">
        <div className="publish__intro">
          <h2 id="h-publish">What we will publish, and when</h2>
          <p>Basilisk 2 is under characterisation. We describe how it is built today. Its performance numbers arrive after a laboratory outside ours has reproduced them, together with the data, not before.</p>
        </div>
        <table className="facts">
          <caption className="visually-hidden">Basilisk 2 construction and publication status</caption>
          <tbody>
            {BASILISK_FACTS.map(([k, v]) => (
              <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <figure className="bleed">
        <Img name="basilisk-2-die-macro" alt="Close view of the Basilisk 2 die in its package: meandering resonators and cross-shaped qubits in aluminium on dark silicon, ringed by wire bonds." sizes="100vw" />
        <figcaption>The die in its package. Each meander is a readout resonator; the bonds along the edge carry the drive, flux and readout lines in from the interposer.</figcaption>
      </figure>

      <section className="process" aria-labelledby="h-process">
        <h2 id="h-process">From wafer to cooldown</h2>
        <ol className="process__steps">
          <li><span className="mono">01</span><h3>Ground plane and circuit</h3><p>Aluminium is deposited on high-resistivity silicon and etched into feedlines, resonators, couplers and qubit crosses.</p></li>
          <li><span className="mono">02</span><h3>Junctions</h3><p>Two evaporations at two angles through one resist mask, with a controlled oxidation between them, leave each Al/AlOx/Al junction and its faint shadow.</p></li>
          <li><span className="mono">03</span><h3>Airbridges and inspection</h3><p>Bridges tie the ground plane together over every line. Each wafer is mapped under the microscope before dicing.</p></li>
          <li><span className="mono">04</span><h3>Package and cooldown</h3><p>A die is bonded into its package, closed, mounted in the magnetic shield below the mixing chamber and cooled over about two days.</p></li>
        </ol>
        <figure className="process__image">
          <Img name="basilisk-2-wafer-inspection" alt="A Basilisk wafer under an inspection microscope, its dies catching the light in rainbow interference colours." sizes="(min-width: 960px) 44vw, 100vw" />
        </figure>
      </section>

      <section className="partner" data-surface="dark" aria-labelledby="h-b2-partner">
        <h2 id="h-b2-partner">Measure it with us</h2>
        <p>We are looking for two outside laboratories to reproduce our characterisation of Basilisk 2. <Link to="/">See the processor opened on the home page</Link>, or write to us.</p>
        <a className="partner__mail" href={`mailto:${COMPANY.emails.partnerships}?subject=Basilisk%202%20characterisation`}>{COMPANY.emails.partnerships}</a>
      </section>
    </>
  );
}
