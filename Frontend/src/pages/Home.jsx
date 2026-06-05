import React from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import { Icon, LinkedInIcon } from "../components/icons.jsx";
import { Reveal } from "../components/Reveal.jsx";
import { profile, stats, abilities, skills, education, honors } from "../resumeData.js";

/* Build two opposing marquee rows from the flat skill list. */
const allSkills = skills.flatMap((g) => g.items);
const splitAt = Math.ceil(allSkills.length / 2);
const marqueeRows = [allSkills.slice(0, splitAt), allSkills.slice(splitAt)];

export default function Home() {
  return (
    <>
      <Nav />

      {/* ---------- Hero (full-bleed) ---------- */}
      <section className="hero">
        <div className="hero-objects" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
          <span className="hero-ring" />
          <span className="hero-mesh" />
        </div>

        <div className="hero-content">
          <div className="hero-inner">
            <p className="eyebrow">{profile.title}</p>
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
        </div>
      </section>

      <main className="portfolio">
        {/* ---------- What I can do (animated) ---------- */}
        <section className="pf-section abilities">
          <div className="do-objects" aria-hidden="true">
            <span className="do-shape s1" />
            <span className="do-shape s2" />
            <span className="do-shape s3" />
            <span className="do-shape s4" />
          </div>
          <Reveal><h2 className="pf-h2"><span className="pf-h2-i">01</span> What I can do</h2></Reveal>
          <div className="do-grid">
            {abilities.map((a, i) => (
              <Reveal key={a.title} delay={(i % 2) * 70}>
                <article className="do-card">
                  <span className="do-icon"><Icon name={a.icon} size={24} /></span>
                  <div className="do-text">
                    <h3>{a.title}</h3>
                    <p>{a.sub}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Toolkit (marquee) ---------- */}
        <section className="pf-section">
          <Reveal><h2 className="pf-h2"><span className="pf-h2-i">02</span> Toolkit</h2></Reveal>
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
              <h2 className="pf-h2"><span className="pf-h2-i">03</span> Education</h2>
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
              <h2 className="pf-h2"><span className="pf-h2-i">04</span> Honors</h2>
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
