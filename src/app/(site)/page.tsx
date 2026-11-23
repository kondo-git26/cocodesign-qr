import { Audience } from '@/components/sections/Audience';
import { Faq } from '@/components/sections/Faq';
import { Features } from '@/components/sections/Features';
import { HowTo } from '@/components/sections/HowTo';
import { PrintHelpBand } from '@/components/print/PrintHelpBand';
import { Pricing } from '@/components/sections/Pricing';
import { Problems } from '@/components/sections/Problems';
import { Samples } from '@/components/sections/Samples';
import { DropStage } from '@/components/v2/DropStage';

/**
 * トップページ。
 * ファーストビューと変換を一体化し、置く場所をひとつだけ置いています。
 * 旧デザイン（分離していた頃）は /v1/ に残しています。
 */
export default function HomePage() {
  return (
    <>
      <PrintHelpBand />
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
