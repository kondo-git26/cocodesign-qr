import { Audience } from '@/components/sections/Audience';
import { Faq } from '@/components/sections/Faq';
import { Features } from '@/components/sections/Features';
import { HowTo } from '@/components/sections/HowTo';
import { Pricing } from '@/components/sections/Pricing';
import { Problems } from '@/components/sections/Problems';
import { Samples } from '@/components/sections/Samples';
import { DropStage } from '@/components/v2/DropStage';

/**
 * 試作 v2：ファーストビューと変換フォームを一体化した版。
 * FV 以下のセクションは現行版と共通です（比較のため）。
 */
export default function V2Page() {
  return (
    <>
      <DropStage />
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
