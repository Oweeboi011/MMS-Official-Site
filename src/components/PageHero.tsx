import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { asset } from '../lib/asset';
import { sectionPath, sitemap } from '../data/sitemap';

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
}

// Home › Section › Page, for any page under a sitemap section.
function Breadcrumbs({ title }: { title: string }) {
  const { pathname } = useLocation();
  const section = sitemap.find((s) => pathname.startsWith(`/${s.slug}/`));
  if (!section) return null;
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/">Home</Link></li>
        <li><Link to={sectionPath(section)}>{section.label}</Link></li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}

export default function PageHero({ eyebrow, title, intro, image }: Props) {
  return (
    <header className="hero page-hero" style={{ '--hero-image': `url("${asset(image)}")` } as CSSProperties}>
      <div className="shell hero-content">
        <Breadcrumbs title={title} />
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="hero-copy">{intro}</p>
      </div>
    </header>
  );
}
