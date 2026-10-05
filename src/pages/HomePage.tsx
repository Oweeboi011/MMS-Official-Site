import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import Intro from '../components/Intro';
import About from '../components/About';
import Journey from '../components/Journey';
import Programs from '../components/Programs';
import Mountains from '../components/Mountains';
import OpenClimbs from '../components/OpenClimbs';
import Announcements from '../components/Announcements';
import HowToJoin from '../components/HowToJoin';
import Passport from '../components/Passport';
import Gallery from '../components/Gallery';
import Faq from '../components/Faq';
import JoinCta from '../components/JoinCta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ticker />
      <main>
        <Intro />
        <About />
        <Journey />
        <Programs />
        <Mountains />
        <OpenClimbs limit={4} />
        <Announcements limit={3} />
        <HowToJoin />
        <Passport />
        <Gallery />
        <Faq />
        <JoinCta />
      </main>
    </>
  );
}
