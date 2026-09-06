/**
 * 旧デザイン（比較用）。ファーストビューと変換フォームを分けていた頃の構成。
 */
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

export default function V1Page() {
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
