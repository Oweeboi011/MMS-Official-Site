import type { CSSProperties } from 'react';
import { asset } from '../lib/asset';
import Nav from './Nav';

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
}

export default function PageHero({ eyebrow, title, intro, image }: Props) {
  return (
    <header className="hero page-hero" style={{ '--hero-image': `url("${asset(image)}")` } as CSSProperties}>
      <Nav />
      <div className="shell hero-content">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="hero-copy">{intro}</p>
      </div>
    </header>
  );
}
