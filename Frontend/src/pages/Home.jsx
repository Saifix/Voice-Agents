import React from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import {
  profile, stats, experience, skills, education, honors,
} from "../resumeData.js";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="portfolio">
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <p className="eyebrow">{profile.title}</p>
          <h1 className="hero-name">{profile.name}</h1>
          <p className="hero-tagline">{profile.tagline}</p>
          <p className="hero-summary">{profile.summary}</p>

          <div className="hero-cta">
            <Link className="btn-cta" to="/demos">Explore live demos →</Link>
            <a className="btn-cta ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="btn-cta ghost" href={`mailto:${profile.email}`}>Email</a>
          </div>

          <div className="hero-stats">
            {stats.map((s) => (
              <div className="hstat" key={s.l}>
                <div className="hstat-n">{s.n}</div>
                <div className="hstat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Experience ---------- */}
        <section className="pf-section">
          <h2 className="pf-h2">Experience</h2>
          <div className="timeline">
            {experience.map((job) => (
              <article className="tl-item" key={job.company}>
                <div className="tl-head">
                  <div>
                    <h3 className="tl-role">{job.role}</h3>
                    <div className="tl-company">{job.company} · {job.location}</div>
                  </div>
                  <span className="tl-period">{job.period}</span>
                </div>
                <ul className="tl-bullets">
                  {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Skills ---------- */}
        <section className="pf-section">
          <h2 className="pf-h2">Skills</h2>
          <div className="skill-groups">
            {skills.map((g) => (
              <div className="skill-group" key={g.group}>
                <h4 className="skill-group-name">{g.group}</h4>
                <div className="chips">
                  {g.items.map((it) => <span className="chip" key={it}>{it}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Education + Honors ---------- */}
        <section className="pf-section pf-two">
          <div>
            <h2 className="pf-h2">Education</h2>
            {education.map((e) => (
              <div className="edu-item" key={e.degree}>
                <div className="edu-degree">{e.degree}</div>
                <div className="edu-school">{e.school}</div>
                <div className="edu-period">{e.period}</div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="pf-h2">Honors & Leadership</h2>
            <ul className="honors">
              {honors.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
        </section>

        {/* ---------- Footer / contact ---------- */}
        <footer className="pf-footer">
          <div className="pf-footer-cta">
            <h2>Let’s build something.</h2>
            <p>{profile.location}</p>
          </div>
          <div className="pf-footer-links">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <Link to="/demos">Live Demos</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
