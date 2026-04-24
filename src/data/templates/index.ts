/**
 * templates 폴더 진입점
 *
 * 8개 서비스 템플릿 + 변형 풀(인트로/결론/구조) + 헬퍼를 한 곳에서 export.
 * blog-templates.ts에서 이 파일만 import하면 모두 사용 가능.
 */

import type { ServiceType } from '../url-suffixes';
import type { ServiceTemplate } from './types';

import { toiletTemplate } from './service-toilet';
import { sinkTemplate } from './service-sink';
import { drainTemplate } from './service-drain';
import { leakTemplate } from './service-leak';
import { airconTemplate } from './service-aircon';
import { sewageTemplate } from './service-sewage';
import { rainpipeTemplate } from './service-rainpipe';
import { manholeTemplate } from './service-manhole';

export { hashString, pickVariation, pickMultiple, fill } from './helpers';
export { introPool } from './intro-pool';
export { conclusionPool } from './conclusion-pool';
export { bodyStructures, pickBodyStructure } from './body-structures';
export { pickIntro, pickConclusion } from './intent-selectors';
export {
  thumbnails,
  thumbnailsByService,
  pickThumbnail,
  SERVICE_TO_SLUG,
} from './thumbnails';
export type {
  ServiceTemplate,
  SectionTemplate,
  SectionVariation,
  FaqVariation,
} from './types';

/**
 * 8개 서비스 타입 → 템플릿 매핑
 *
 * G1 단계에서는 신규 5개를 drainTemplate로 임시 매핑했으나,
 * G6에서 모두 진짜 템플릿으로 교체되었습니다.
 */
export const templateMap: Record<ServiceType, ServiceTemplate> = {
  변기막힘: toiletTemplate,
  싱크대막힘: sinkTemplate,
  하수구막힘: drainTemplate,
  누수탐지: leakTemplate,
  에어컨배관청소: airconTemplate,
  오수관막힘: sewageTemplate,
  우수관막힘: rainpipeTemplate,
  맨홀청소: manholeTemplate,
};
