import React from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import { Icon, LinkedInIcon } from "../components/icons.jsx";
import { Reveal } from "../components/Reveal.jsx";
import {
  profile, stats, capabilities, work, skills, education, honors,
} from "../resumeData.js";

/* Build two opposing marquee rows from the flat skill list. */
const allSkills = skills.flatMap((g) => g.items);
const splitAt = Math.ceil(allSkills.length / 2);
const marqueeRows = [allSkills.slice(0, splitAt), allSkills.slice(splitAt)];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="portfolio">
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <div className="hero-objects" aria-hidden="true">
            <span className="orb orb-1" />
            <span className="orb orb-2" />
            <span className="orb orb-3" />
            <span className="hero-ring" />
            <span className="hero-mesh" />
          </div>

          <div className="hero-inner">
            <p className="eyebrow"><span className="eyebrow-dot" /> {profile.title}</p>
            <h1 className="hero-name">{profile.name}</h1>
            <p className="hero-tagline">{profile.tagline}</p>
            <p className="hero-summary">{profile.summary}</p>

            <div className="hero-cta">
              <Link className="btn-cta" to="/demos">
                Explore live demos <Icon name="arrowRight" size={18} />
              </Link>
              <a className="btn-cta ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
                <LinkedInIcon size={16} /> LinkedIn
              </a>
              <a className="btn-cta ghost" href={`mailto:${profile.email}`}>
                <Icon name="mail" size={16} /> Email
              </a>
            </div>
          </div>

          <div className="hero-stats">
            {stats.map((s, i) => (
              <Reveal key={s.l} delay={i * 80}>
                <div className="hstat">
                  <div className="hstat-n">{s.n}</div>
                  <div className="hstat-l">{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="scroll-cue" aria-hidden="true"><Icon name="arrowDown" size={20} /></div>
        </section>

        {/* ---------- Capabilities ---------- */}
        <section className="pf-section">
          <Reveal><h2 className="pf-h2"><span className="pf-h2-i">01</span> What I build</h2></Reveal>
          <div className="cap-grid">
            {capabilities.map((c, i) => (
              <Reveal key={c.key} delay={i * 90}>
                <article className="cap-card">
                  <span className="cap-icon"><Icon name={c.icon} size={26} /></span>
                  <h3>{c.title}</h3>
                  <p>{c.blurb}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Selected work ---------- */}
        <section className="pf-section">
          <Reveal><h2 className="pf-h2"><span className="pf-h2-i">02</span> Selected work</h2></Reveal>
          <div className="work-list">
            {work.map((w, i) => (
              <Reveal key={i} delay={60}>
                <article className="work-card">
                  <div className="work-index">{String(i + 1).padStart(2, "0")}</div>
                  <div className="work-body">
                    <div className="work-head">
                      <div>
                        <h3 className="work-role">{w.role}</h3>
                        <div className="work-context">{w.context}</div>
                      </div>
                      <span className="work-period">{w.period}</span>
                    </div>
                    <ul className="work-highlights">
                      {w.highlights.map((h, j) => <li key={j}>{h}</li>)}
                    </ul>
                    <div className="work-tags">
                      {w.tags.map((t) => <span className="wtag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Toolkit (marquee) ---------- */}
        <section className="pf-section">
          <Reveal><h2 className="pf-h2"><span className="pf-h2-i">03</span> Toolkit</h2></Reveal>
          <div className="marquee">
            {marqueeRows.map((row, r) => (
              <div className="mq-row" key={r}>
                <div className={`mq-track ${r % 2 ? "reverse" : ""}`}>
                  {[...row, ...row].map((s, i) => <span className="mq-chip" key={i}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Education + Honors ---------- */}
        <section className="pf-section pf-two">
          <Reveal>
            <div>
              <h2 className="pf-h2"><span className="pf-h2-i">04</span> Education</h2>
              {education.map((e) => (
                <div className="edu-item" key={e.degree}>
                  <div className="edu-degree">{e.degree}</div>
                  <div className="edu-school">{e.school}</div>
                  <div className="edu-period">{e.period}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <h2 className="pf-h2"><span className="pf-h2-i">05</span> Honors</h2>
              <ul className="honors">
                {honors.map((h, i) => (
                  <li key={i}><Icon name="award" size={18} /> <span>{h}</span></li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* ---------- Footer ---------- */}
        <Reveal>
          <footer className="pf-footer">
            <div className="pf-footer-cta">
              <h2>Let’s build something.</h2>
              <p><Icon name="pin" size={15} /> {profile.location}</p>
            </div>
            <div className="pf-footer-links">
              <a href={`mailto:${profile.email}`}><Icon name="mail" size={15} /> {profile.email}</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon size={15} /> LinkedIn</a>
              <Link to="/demos"><Icon name="arrowRight" size={15} /> Live Demos</Link>
            </div>
          </footer>
        </Reveal>
      </main>
    </>
  );
}
