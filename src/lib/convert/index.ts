/**
 * 変換サービスの入口。
 *
 * NEXT_PUBLIC_CONVERT_API_BASE が設定されていればサーバー API を、
 * 未設定ならブラウザ内で完結する実装を返します。画面側は常にこの関数だけを使います。
 */

import { createHttpConverterApi } from './httpApi';
import { createLocalConverterApi } from './localApi';
import type { ConverterApi } from './types';

let cached: ConverterApi | null = null;

export function getConverterApi(): ConverterApi {
  if (cached) return cached;

  const base = process.env.NEXT_PUBLIC_CONVERT_API_BASE;
  cached = base && base.length > 0 ? createHttpConverterApi(base) : createLocalConverterApi();
  return cached;
}

export * from './types';
