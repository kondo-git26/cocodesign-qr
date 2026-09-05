import { SAMPLE_QR_CONTENT } from '@/lib/content/site';
import { encodeQr } from '@/lib/qr/encoder';

/**
 * 「試してみる」用のサンプル画像をその場で生成します。
 * 実際の支給画像と同じ条件（低解像度・JPEG 圧縮）にして、本物の読み取り処理を通します。
 */
export async function makeSampleFile(): Promise<File> {
  const matrix = encodeQr(SAMPLE_QR_CONTENT, 'M');
  const quiet = 3;
  const total = matrix.size + quiet * 2;

  // まず高解像度で描く
  const crispPx = 10;
  const crisp = document.createElement('canvas');
  crisp.width = total * crispPx;
  crisp.height = total * crispPx;
  const cctx = crisp.getContext('2d');
  if (!cctx) throw new Error('この環境ではサンプルを生成できません。');
  cctx.fillStyle = '#FFFFFF';
  cctx.fillRect(0, 0, crisp.width, crisp.height);
  cctx.fillStyle = '#000000';
  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (matrix.modules[row][col]) {
        cctx.fillRect((col + quiet) * crispPx, (row + quiet) * crispPx, crispPx, crispPx);
      }
    }
  }

  // 1 セルあたり約 1.9px まで縮小し、JPEG で保存する（よくある支給画像の状態）
  const pxPerModule = 1.9;
  const side = Math.round(total * pxPerModule);
  const small = document.createElement('canvas');
  small.width = side;
  small.height = side;
  const sctx = small.getContext('2d');
  if (!sctx) throw new Error('この環境ではサンプルを生成できません。');
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(crisp, 0, 0, side, side);

  const blob = await new Promise<Blob>((resolve, reject) => {
    small.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('サンプルの生成に失敗しました。'))),
      'image/jpeg',
      0.6,
    );
  });
  return new File([blob], 'sample-qr.jpg', { type: 'image/jpeg' });
}
