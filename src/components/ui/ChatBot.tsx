"use client";

import { useState, useEffect, useRef } from 'react';
import { siteConfig } from '@/config/site';
import { phoneLink, formatPhone } from '@/lib/utils';

/* ============================================================
   타입 정의
   ============================================================ */
interface Message {
  role: 'bot' | 'user';
  text: string;
}

/* ============================================================
   상수: mainFaq 에서 추출한 답변 원문 (page.tsx 재활용)
   ============================================================ */
const FAQ_24H =
  '네, 전주·익산·군산·정읍·남원·김제 등 전라북도 14개 시/군 전 지역 24시 작업 가능합니다. 언제든지 편하게 문의주세요.';
const FAQ_CAUSE =
  '주방에선 기름 찌꺼기, 욕실에선 머리카락, 세면대에선 비누 찌꺼기 등이 주 원인입니다. 오래된 배관에는 녹·곰팡이·미생물 슬러지도 문제를 일으킬 수 있어요.';
const FAQ_COST =
  '현장 상태에 따라 다릅니다. 출장 후 원인 · 작업 범위를 진단한 뒤 투명하게 견적을 드립니다. 동의 전까지는 비용 청구가 없습니다.';
const FAQ_FREE_VISIT =
  '출장비는 무료입니다. 현장 진단 후 작업 비용만 안내드리며, 사전 동의 후 작업을 진행합니다.';
const FAQ_WEEKEND =
  '네, 365일 24시간 동일 기준으로 안내드립니다. 야간·주말 할증 없이 출장비 무료로 방문합니다.';
const FAQ_AS =
  '네, 모든 작업에 일정 기간 무상 A/S를 제공합니다. 동일 원인 재발 시 무상으로 재방문합니다.';
const FAQ_INSURANCE =
  '네, 배상책임보험에 가입되어 있어 작업 중 발생할 수 있는 문제에 대해 보상 체계가 마련돼 있습니다. 안심하고 맡기세요.';

/* ============================================================
   Quick reply 정의
   ============================================================ */
interface QuickReply {
  label: string;
  userText: string;
  botTexts: string[];
}

const QUICK_REPLIES: QuickReply[] = [
  {
    label: '🚽 막힘 문제 상담',
    userText: '변기·싱크대·하수구 막힘이 있어요',
    botTexts: [
      FAQ_CAUSE,
      '정확한 진단은 현장 상담이 필수입니다. 전화 또는 카카오 상담을 이용해 주세요.',
    ],
  },
  {
    label: '💰 비용·견적 궁금해요',
    userText: '비용이 얼마나 드나요?',
    botTexts: [
      FAQ_COST,
      FAQ_FREE_VISIT,
      '출장·진단까지 무료! 견적 동의 전까지 비용 없음.',
    ],
  },
  {
    label: '⏰ 출동 시간 문의',
    userText: '언제 와주시나요?',
    botTexts: [
      FAQ_24H,
      FAQ_WEEKEND,
      '전북 14 시/군 평균 30분 내 도착. 야간·주말·공휴일 할증 0원.',
    ],
  },
  {
    label: '🛡️ A/S·보험',
    userText: '보증·보험은요?',
    botTexts: [FAQ_AS, FAQ_INSURANCE],
  },
];

const INITIAL_BOT_TEXT =
  '👋 안녕하세요! 전북하수구입니다.\n어떤 문제로 오셨나요? 아래에서 선택해 주세요.';

/* ============================================================
   ChatBot Component
   ============================================================ */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: INITIAL_BOT_TEXT },
  ]);
  const [showQuickReply, setShowQuickReply] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  /* Esc 닫기 */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // 포커스 복귀: 닫기 버튼 DOM 제거 후 열기 버튼 마운트까지 대기
        setTimeout(() => openButtonRef.current?.focus(), 0);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /* 모달 열릴 때 닫기 버튼으로 포커스 */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  /* 새 메시지 시 스크롤 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    // 포커스 복귀: 닫기 버튼 DOM 제거 후 열기 버튼 마운트까지 대기
    setTimeout(() => openButtonRef.current?.focus(), 0);
  }

  function handleRestart() {
    setMessages([{ role: 'bot', text: INITIAL_BOT_TEXT }]);
    setShowQuickReply(true);
  }

  function handleQuickReply(qr: QuickReply) {
    setShowQuickReply(false);
    const userMsg: Message = { role: 'user', text: qr.userText };
    const botMsgs: Message[] = qr.botTexts.map((t) => ({ role: 'bot' as const, text: t }));
    setMessages((prev) => [...prev, userMsg, ...botMsgs]);
  }

  return (
    <>
      {/* ─── 플로팅 버튼 ─── */}
      {!isOpen && (
        <button
          ref={openButtonRef}
          className="chatbot-button"
          onClick={handleOpen}
          aria-label="상담 챗봇 열기"
          type="button"
        >
          <span className="chatbot-pulse" aria-hidden="true" />
          {/* Chat bubble SVG */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 1-1.73V4z"
              fill="white"
              opacity="0.95"
            />
            <circle cx="10" cy="11" r="1.4" fill="#FF6B2C" />
            <circle cx="14" cy="11" r="1.4" fill="#FF6B2C" />
            <circle cx="18" cy="11" r="1.4" fill="#FF6B2C" />
          </svg>
        </button>
      )}

      {/* ─── 모달 ─── */}
      {isOpen && (
        <div
          className="chatbot-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-title"
        >
          {/* 헤더 */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar" aria-hidden="true">전</div>
              <div>
                <p id="chatbot-title" className="chatbot-header-name">전북하수구 상담</p>
                <p className="chatbot-header-sub">24시 365일 응답</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              className="chatbot-close"
              onClick={handleClose}
              aria-label="챗봇 닫기"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 2l14 14M16 2L2 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="chatbot-messages" role="log" aria-live="polite" aria-label="대화 내용">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.role === 'bot' ? 'chatbot-msg-bot' : 'chatbot-msg-user'}
              >
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            ))}

            {/* CTA 행: 메시지가 2개 이상이고 퀵리플라이 숨겨진 경우 */}
            {!showQuickReply && messages.length > 1 && (
              <>
                <div className="chatbot-msg-bot chatbot-cta-text">
                  지금 바로 상담 받으시려면 아래로 연락해 주세요.
                </div>
                <div className="chatbot-cta-row">
                  <a
                    href={phoneLink()}
                    className="chatbot-cta-phone"
                    aria-label={`전화 상담 ${formatPhone()}`}
                  >
                    📞 {formatPhone()} 전화
                  </a>
                  <a
                    href={siteConfig.kakaoUrl}
                    className="chatbot-cta-kakao"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="카카오 상담"
                  >
                    💬 카카오 상담
                  </a>
                </div>
                <button
                  className="chatbot-restart"
                  onClick={handleRestart}
                  type="button"
                  aria-label="다른 질문하기"
                >
                  🔄 다른 질문하기
                </button>
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply 버튼 */}
          {showQuickReply && (
            <div className="chatbot-quickreply-grid" role="group" aria-label="빠른 답변 선택">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.label}
                  className="chatbot-quickreply"
                  onClick={() => handleQuickReply(qr)}
                  type="button"
                  aria-label={qr.label}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
