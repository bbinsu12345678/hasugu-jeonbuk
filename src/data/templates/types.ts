/**
 * 콘텐츠 변형 시스템 타입 정의
 */

export interface SectionVariation {
  title: string;
  content: string;
}

export interface FaqVariation {
  question: string;
  answer: string;
}

export interface SectionTemplate {
  id: string;
  imageAlt: string;
  variations: SectionVariation[];
}

export interface ServiceTemplate {
  slugSuffix: string;
  titleVariations: string[];
  excerptVariations: string[];
  sections: SectionTemplate[];
  faqPool: FaqVariation[];
}
