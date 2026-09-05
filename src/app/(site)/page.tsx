import { Audience } from '@/components/sections/Audience';
import { Converter } from '@/components/sections/Converter';
import { Faq } from '@/components/sections/Faq';
import { Features } from '@/components/sections/Features';
import { Glossary } from '@/components/sections/Glossary';
import { Hero } from '@/components/sections/Hero';
import { HowTo } from '@/components/sections/HowTo';
import { Pricing } from '@/components/sections/Pricing';
import { Problems } from '@/components/sections/Problems';
import { Samples } from '@/components/sections/Samples';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Converter />
      <Glossary />
      <Features />
      <Problems />
      <HowTo />
      <Samples />
      <Pricing />
      <Audience />
      <Faq />
    </>
  );
}
