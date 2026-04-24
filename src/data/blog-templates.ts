/**
 * 블로그 포스트 자동 생성 오케스트레이터
 *
 * 이 파일은 얇은 진입점입니다. 실제 데이터/로직은 templates/ 폴더에 분리:
 * - templates/intro-pool.ts       (인트로 50개)
 * - templates/conclusion-pool.ts  (결론 50개)
 * - templates/body-structures.ts  (본문 구조 8패턴)
 * - templates/service-*.ts        (8개 서비스 템플릿)
 * - templates/helpers.ts          (해시/변형 선택 헬퍼)
 * - templates/index.ts            (templateMap + 통합 export)
 */

import type { BlogPost, BlogSection, FaqItem } from '@/types';
import { regions } from './regions';
import { urlSuffixes, type UrlSuffix } from './url-suffixes';
import {
  hashString,
  pickVariation,
  pickMultiple,
  fill,
  pickIntro,
  pickConclusion,
  pickBodyStructure,
  pickThumbnail,
  templateMap,
} from './templates';

function generatePost(
  dong: string,
  city: string,
  urlSuffix: UrlSuffix,
  allDistricts: string[],
  index: number,
): BlogPost {
  const serviceType = urlSuffix.serviceType;
  const tmpl = templateMap[serviceType];
  const suffixHash = hashString(dong + urlSuffix.suffix);

  // URL suffix의 주요 키워드를 Title에 반영 (경쟁사와 차별화)
  const kwPrefix = urlSuffix.primaryKeywords.slice(0, 2).join(' ');
  const baseTitle = fill(
    pickVariation(tmpl.titleVariations, dong, suffixHash),
    dong,
    city,
  );
  const title = `${dong} ${kwPrefix} - ${baseTitle}`.slice(0, 60);

  const excerpt = fill(
    pickVariation(tmpl.excerptVariations, dong, suffixHash + 1),
    dong,
    city,
  );

  // 6 변형 축: 인트로 + 본문 구조 + 결론 (의도 기반)
  const intro = fill(pickIntro(urlSuffix.intent, suffixHash), dong, city);
  const conclusion = fill(
    pickConclusion(urlSuffix.intent, suffixHash + 7),
    dong,
    city,
  );
  const sectionOrder = pickBodyStructure(suffixHash);

  // 블로그 콘텐츠 이미지 — 서비스별 풀에서 해시 기반 선택 (제목↔이미지 매칭 보장)
  const imageAt = (offset: number) =>
    pickThumbnail(serviceType, suffixHash, offset);

  // 인트로 섹션 (s0)
  const introSection: BlogSection = {
    id: 's0',
    title: `${dong} ${urlSuffix.primaryKeywords[0]} 한 번에 해결`,
    image: imageAt(0),
    imageAlt: `${dong} ${urlSuffix.primaryKeywords[0]} 전문 안내`,
    content: intro,
  };

  // 본문 섹션 (구조 순서대로)
  const bodySections: BlogSection[] = sectionOrder.map((origIdx, displayIdx) => {
    const s = tmpl.sections[origIdx];
    const v = pickVariation(s.variations, dong, suffixHash + origIdx);
    return {
      id: `s${displayIdx + 1}`,
      title: fill(v.title, dong, city),
      image: imageAt(origIdx + 1),
      imageAlt: `${dong} ${urlSuffix.primaryKeywords[0]} ${s.imageAlt}`,
      content: fill(v.content, dong, city),
    };
  });

  // 결론 섹션 (s6)
  const conclusionSection: BlogSection = {
    id: 's6',
    title: `${dong} 배관 전문가 마무리 안내`,
    image: imageAt(6),
    imageAlt: `${dong} ${urlSuffix.primaryKeywords[0]} 마무리`,
    content: conclusion,
  };

  const sections: BlogSection[] = [
    introSection,
    ...bodySections,
    conclusionSection,
  ];

  const selectedFaq = pickMultiple(tmpl.faqPool, dong + urlSuffix.suffix, 3);
  const faq: FaqItem[] = selectedFaq.map((f) => ({
    question: fill(f.question, dong, city),
    answer: fill(f.answer, dong, city),
  }));

  return {
    slug: `${dong}${urlSuffix.suffix}`,
    city,
    title,
    thumbnail: pickThumbnail(serviceType, suffixHash, index),
    excerpt,
    sections,
    regionTable: allDistricts.map((d) => ({ district: d })),
    keywords: [
      `${dong}${urlSuffix.primaryKeywords[0]}`,
      ...urlSuffix.primaryKeywords.map((k) => `${dong}${k}`),
      `${city}${serviceType}`,
      `${dong}변기막힘`,
      `${dong}싱크대막힘`,
      `${dong}하수구막힘`,
    ],
    faq,
  };
}

/**
 * regions.ts × url-suffixes.ts 조합으로 블로그 포스트 자동 생성
 *
 * 동당 N개 URL × 251개 동 = (urlSuffixes 길이) × 251 포스트
 */
export function generateBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  let index = 0;

  for (const region of regions) {
    for (const dong of region.districts) {
      for (const urlSuffix of urlSuffixes) {
        posts.push(
          generatePost(dong, region.city, urlSuffix, region.districts, index),
        );
        index++;
      }
    }
  }

  return posts;
}
