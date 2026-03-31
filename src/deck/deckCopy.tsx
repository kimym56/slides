import type { ReactNode } from "react";

export type Locale = "en" | "ko";

interface OverviewSlideCopy {
  description: string;
  features: string[];
  featuresLabel: string;
  mediaAlt?: string;
  projectNumber: string;
  projectTitle: string;
  subtitle: string;
  techStack: string[];
}

interface DetailSlideCopy {
  descriptions: ReactNode[];
  detailTitle: string;
  title: string;
}

interface ImageDetailSlideCopy extends DetailSlideCopy {
  imageAlt: string;
}

interface DeckCopy {
  contact: {
    emailHref: string;
    emailLabel: string;
    githubHref: string;
    githubLabel: string;
    linkedinHref: string;
    linkedinLabel: string;
    title: string;
    outroTitle: string;
  };
  dsskillsDetail1: ImageDetailSlideCopy;
  dsskillsDetail2: ImageDetailSlideCopy;
  dsskillsOverview: OverviewSlideCopy & {
    title: string;
  };
  introduction: {
    educationDate: string;
    educationDegree: string;
    educationLabel: string;
    experienceDate: string;
    experienceLabel: string;
    experienceRole: string;
    greeting: string;
    profileAlt: string;
    sentence: string;
    title: string;
  };
  mimesisDetail1: DetailSlideCopy;
  mimesisDetail2: DetailSlideCopy;
  mimesisDetail3: DetailSlideCopy;
  mimesisDetail4: DetailSlideCopy;
  mimesisOverview: OverviewSlideCopy & {
    title: string;
  };
  portfolio: {
    heroSubtitle: string;
    heroTitle: string;
    title: string;
    year: string;
  };
  sellpathDetail1: ImageDetailSlideCopy;
  sellpathDetail2: ImageDetailSlideCopy;
  sellpathOverview: OverviewSlideCopy & {
    title: string;
  };
}

export const deckCopy: Record<Locale, DeckCopy> = {
  en: {
    contact: {
      emailHref: "mailto:hello@example.com",
      emailLabel: "Email",
      githubHref: "#",
      githubLabel: "GitHub",
      linkedinHref: "#",
      linkedinLabel: "LinkedIn",
      outroTitle: "Thank you.",
      title: "Contact",
    },
    dsskillsDetail1: {
      descriptions: [
        "Users can generate design system components by applying currently popular UI-related agent skills.",
        "Users can select both the target design system component and the skills to immediately see what kind of output is produced.",
      ],
      detailTitle: "Agent Skill Selection",
      imageAlt: "DSSkills prompt engineering screenshot",
      title: "02 — DSSkills Details",
    },
    dsskillsDetail2: {
      descriptions: [
        "Generated results can be previewed immediately.",
        "Previous outputs can also be reviewed through the history view.",
      ],
      detailTitle: "Design System Component Output and Code",
      imageAlt: "DSSkills validation sandbox screenshot",
      title: "02 — DSSkills Details 2",
    },
    dsskillsOverview: {
      description:
        "A playground for quickly applying trending agent skills to design system components and instantly previewing the results.",
      features: [
        "Generation powered by the OpenAI API",
        "Instant output preview",
        "Code copy functionality",
      ],
      featuresLabel: "Key Features",
      mediaAlt: "DSSkills project screenshot",
      projectNumber: "02",
      projectTitle: "DSSkills",
      subtitle: "Design System with Agent Skills",
      techStack: [
        "Next.js",
        "React",
        "TypeScript",
        "OpenAI API",
        "PostgresQL",
        "Prisma",
        "Tailwind CSS",
      ],
      title: "02 — DSSkills",
    },
    introduction: {
      educationDate: "20.03 - 23.08",
      educationDegree: "Yonsei University - Bachelor of Computer Science",
      educationLabel: "Education",
      experienceDate: "24.02 - 26.01",
      experienceLabel: "Experience",
      experienceRole: "Sellpath.inc - Frontend Engineer",
      greeting: "Hello",
      profileAlt: "YongMin Kim",
      sentence:
        "I am YongMin Kim, a Design Engineer dedicated to crafting 'optimal experiences' at the intersection of technology and design.",
      title: "Introduction",
    },
    mimesisDetail1: {
      descriptions: [
        "The corner-peel effect used in iBooks and Apple Maps.",
        "Users can drag any corner to peel the page back and reveal the reverse side.",
        <>
          Inspired by{" "}
          <a
            href="https://www.linkedin.com/posts/minsangchoi_metalshader-activity-7431057118914490368-L5TN/"
            target="_blank"
            rel="noreferrer"
          >
            Minsang Choi
          </a>
          .
        </>,
        "Rebuilt in R3F based on an original implementation created in iOS SwiftUI.",
      ],
      detailTitle:
        "An interactive recreation of the classic iOS page curl transition",
      title: "01 — Mimesis Details",
    },
    mimesisDetail2: {
      descriptions: [
        "A typography-based wipe simulation inspired by FFF, where a moving band mechanically reveals and transforms text in real time with cursor control.",
        <>
          Inspired by{" "}
          <a href="https://blog.cmiscm.com/?page_id=3023" target="_blank" rel="noreferrer">
            Jongmin Kim
          </a>
          .
        </>,
        "Recreated in R3F by combining the original HTML/CSS-based work with a Tesla 3D model.",
      ],
      detailTitle: "Wiper Typography",
      title: "01 — Mimesis Details 2",
    },
    mimesisDetail3: {
      descriptions: [
        "A monochrome yin-yang playground recreating SABUM’s black and white circle study, featuring a secondary pseudo-sync mode driven by YouTube playback time.",
        <>
          Inspired by{" "}
          <a
            href="https://www.threads.com/@byunsabum/post/DTkg4CWkyVS"
            target="_blank"
            rel="noreferrer"
          >
            SABUM
          </a>
          .
        </>,
        "Embedded YouTube and analyzed browser audio output to drive particle motion in real time.",
      ],
      detailTitle: "Black & White Circle",
      title: "01 — Mimesis Details 3",
    },
    mimesisDetail4: {
      descriptions: [
        "A CSS-first recreation of Rauno Freiberg’s staggered hover lettering, where each character flips through a soft 3D cascade on hover or press.",
        <>
          Inspired by{" "}
          <a
            href="https://x.com/raunofreiberg/status/1826969932099104959"
            target="_blank"
            rel="noreferrer"
          >
            Rauno Freiberg
          </a>
          .
        </>,
        "Recreated a similar interaction using Framer Motion, with dynamic motion previews based on user text input and click interactions.",
      ],
      detailTitle: "Staggered Text",
      title: "01 — Mimesis Details 4",
    },
    mimesisOverview: {
      description:
        "A project focused on recreating interactive UIs and creative digital works, then extending them by applying different web technologies and reinterpretations.",
      features: [
        "3D rendering on the web",
        "Audio capture and analysis",
        "Framer Motion-based interactions",
      ],
      featuresLabel: "Key Features",
      projectNumber: "01",
      projectTitle: "Mimesis",
      subtitle: "Interactive UI Recreation",
      techStack: [
        "Next.js",
        "React",
        "TypeScript",
        "Vite",
        "R3F",
        "Three.js",
        "Framer Motion",
        "Realtime-bpm-analyzer",
      ],
      title: "01 — Mimesis",
    },
    portfolio: {
      heroSubtitle: "YongMin Kim, Design Engineer",
      heroTitle: "Portfolio",
      title: "Portfolio",
      year: "2026",
    },
    sellpathDetail1: {
      descriptions: [
        "Left section of the Activity Modal",
        "A modal that brings together key features needed for sales workflows.",
        "Provides an at-a-glance view of customer context.",
        "Includes a data visualization summarizing customer engagement and sentiment, powered by real-time data and AI analysis.",
        "Designed to help sales teams quickly understand customer status and make informed decisions.",
      ],
      detailTitle: "Activity Modal",
      imageAlt: "Sellpath data visualization screenshot",
      title: "03 — Sellpath Details",
    },
    sellpathDetail2: {
      descriptions: [
        "Right section of the Activity Modal",
        "Supports real-time calls, transcription, and AI agent-powered reply suggestions.",
        "Designed to facilitate seamless communication and efficient sales workflows.",
        "Integrates real-time communication features like WebSocket and OpenAI API(STT) for a responsive user experience.",
      ],
      detailTitle: "Chat UI",
      imageAlt: "Sellpath backend integration screenshot",
      title: "03 — Sellpath Details 2",
    },
    sellpathOverview: {
      description: "Contributed to an AI agent-based CRM and sales platform for the U.S. market.",
      features: [
        "Sales dashboard",
        "Activity Modal",
        "CRM-integrated tables.",
      ],
      featuresLabel: "Key Features",
      mediaAlt: "Sellpath project screenshot",
      projectNumber: "03",
      projectTitle: "Sellpath",
      subtitle: "Worked for 2 years as a Frontend Engineer.",
      techStack: [
        "Next.js",
        "React",
        "TypeScript",
        "OpenAI API",
        "WebSocket",
        "WebRTC",
      ],
      title: "03 — Sellpath",
    },
  },
  ko: {
    contact: {
      emailHref: "mailto:hello@example.com",
      emailLabel: "이메일",
      githubHref: "#",
      githubLabel: "GitHub",
      linkedinHref: "#",
      linkedinLabel: "LinkedIn",
      outroTitle: "감사합니다.",
      title: "연락처",
    },
    dsskillsDetail1: {
      descriptions: [
        "사용자는 현재 많이 활용되는 UI 관련 에이전트 스킬을 적용해 디자인 시스템 컴포넌트를 생성할 수 있습니다.",
        "대상 컴포넌트와 적용할 스킬을 선택하면 어떤 결과가 나오는지 즉시 확인할 수 있습니다.",
      ],
      detailTitle: "에이전트 스킬 선택",
      imageAlt: "DSSkills 프롬프트 엔지니어링 화면",
      title: "02 — DSSkills 상세",
    },
    dsskillsDetail2: {
      descriptions: [
        "생성된 결과는 즉시 미리볼 수 있습니다.",
        "이전 결과물도 히스토리 뷰를 통해 다시 확인할 수 있습니다.",
      ],
      detailTitle: "디자인 시스템 컴포넌트 결과물과 코드",
      imageAlt: "DSSkills 검증 샌드박스 화면",
      title: "02 — DSSkills 상세 2",
    },
    dsskillsOverview: {
      description:
        "트렌디한 UI 관련 에이전트 스킬을 디자인 시스템 컴포넌트에 빠르게 적용하고 결과를 즉시 미리볼 수 있는 플레이그라운드입니다.",
      features: [
        "OpenAI API 기반 생성",
        "즉시 결과 미리보기",
        "코드 복사 기능",
      ],
      featuresLabel: "주요 기능",
      mediaAlt: "DSSkills 프로젝트 스크린샷",
      projectNumber: "02",
      projectTitle: "DSSkills",
      subtitle: "에이전트 스킬을 활용한 디자인 시스템",
      techStack: [
        "Next.js",
        "React",
        "TypeScript",
        "OpenAI API",
        "PostgresQL",
        "Prisma",
        "Tailwind CSS",
      ],
      title: "02 — DSSkills",
    },
    introduction: {
      educationDate: "20.03 - 23.08",
      educationDegree: "연세대학교 - 컴퓨터과학 학사",
      educationLabel: "학력",
      experienceDate: "24.02 - 26.01",
      experienceLabel: "경력",
      experienceRole: "Sellpath.inc - 프론트엔드 엔지니어",
      greeting: "안녕하세요",
      profileAlt: "김용민 프로필 사진",
      sentence:
        "기술과 디자인의 경계에서 '최적의 경험'을 만드는 디자인 엔지니어 김용민입니다.",
      title: "소개",
    },
    mimesisDetail1: {
      descriptions: [
        "iBooks와 Apple Maps에서 사용된 코너 필 효과를 재현했습니다.",
        "사용자는 페이지의 어느 모서리든 드래그해 페이지를 넘기듯 뒤집어 뒷면을 확인할 수 있습니다.",
        <>
          <a
            href="https://www.linkedin.com/posts/minsangchoi_metalshader-activity-7431057118914490368-L5TN/"
            target="_blank"
            rel="noreferrer"
          >
            Minsang Choi
          </a>
          의 작업에서 영감을 받았습니다.
        </>,
        "iOS SwiftUI로 제작된 원본 구현을 바탕으로 R3F에서 다시 구현했습니다.",
      ],
      detailTitle: "고전적인 iOS 페이지 컬 전환을 인터랙티브하게 재현했습니다",
      title: "01 — Mimesis 상세",
    },
    mimesisDetail2: {
      descriptions: [
        "FFF에서 영감을 받은 타이포그래피 기반 와이프 시뮬레이션으로, 이동하는 밴드가 커서 제어에 따라 텍스트를 실시간으로 드러내고 변형합니다.",
        <>
          <a href="https://blog.cmiscm.com/?page_id=3023" target="_blank" rel="noreferrer">
            Jongmin Kim
          </a>
          의 작업에서 영감을 받았습니다.
        </>,
        "기존 HTML/CSS 기반 작업과 Tesla 3D 모델을 결합해 R3F로 재구성했습니다.",
      ],
      detailTitle: "Wiper Typography",
      title: "01 — Mimesis 상세 2",
    },
    mimesisDetail3: {
      descriptions: [
        "SABUM의 black and white circle 스터디를 재현한 모노크롬 음양 플레이그라운드로, YouTube 재생 시간을 기반으로 한 보조 pseudo-sync 모드를 포함합니다.",
        <>
          <a
            href="https://www.threads.com/@byunsabum/post/DTkg4CWkyVS"
            target="_blank"
            rel="noreferrer"
          >
            SABUM
          </a>
          의 작업에서 영감을 받았습니다.
        </>,
        "브라우저 오디오 출력을 분석해 파티클 움직임을 실시간으로 구동했습니다.",
      ],
      detailTitle: "Black & White Circle",
      title: "01 — Mimesis 상세 3",
    },
    mimesisDetail4: {
      descriptions: [
        "Rauno Freiberg의 staggered hover lettering을 CSS 우선 방식으로 재현해, 각 문자가 hover나 press 시 부드러운 3D 캐스케이드를 만듭니다.",
        <>
          <a
            href="https://x.com/raunofreiberg/status/1826969932099104959"
            target="_blank"
            rel="noreferrer"
          >
            Rauno Freiberg
          </a>
          의 작업에서 영감을 받았습니다.
        </>,
        "사용자 텍스트 입력과 클릭 인터랙션에 따라 동적인 모션 프리뷰를 제공하도록 Framer Motion으로 유사한 인터랙션을 재현했습니다.",
      ],
      detailTitle: "Staggered Text",
      title: "01 — Mimesis 상세 4",
    },
    mimesisOverview: {
      description:
        "인터랙티브 UI와 디지털 크리에이티브 작업을 재현하고, 이를 다양한 웹 기술과 재해석으로 확장한 프로젝트입니다.",
      features: [
        "웹 기반 3D 렌더링",
        "오디오 캡처 및 분석",
        "Framer Motion 기반 인터랙션",
      ],
      featuresLabel: "주요 기능",
      projectNumber: "01",
      projectTitle: "Mimesis",
      subtitle: "인터랙티브 UI 재현",
      techStack: [
        "Next.js",
        "React",
        "TypeScript",
        "Vite",
        "R3F",
        "Three.js",
        "Framer Motion",
        "Realtime-bpm-analyzer",
      ],
      title: "01 — Mimesis",
    },
    portfolio: {
      heroSubtitle: "김용민, 디자인 엔지니어",
      heroTitle: "포트폴리오",
      title: "포트폴리오",
      year: "2026",
    },
    sellpathDetail1: {
      descriptions: [
        "Activity Modal의 왼쪽 섹션",
        "세일즈 워크플로에 필요한 핵심 기능을 한곳에 모은 모달입니다.",
        "고객 맥락을 한눈에 파악할 수 있도록 구성했습니다.",
        "실시간 데이터와 AI 분석을 기반으로 고객 참여도와 감정 상태를 요약한 데이터 시각화를 제공합니다.",
        "세일즈 팀이 고객 상태를 빠르게 이해하고 더 나은 의사결정을 내릴 수 있도록 설계했습니다.",
      ],
      detailTitle: "Activity Modal",
      imageAlt: "Sellpath 데이터 시각화 화면",
      title: "03 — Sellpath 상세",
    },
    sellpathDetail2: {
      descriptions: [
        "Activity Modal의 오른쪽 섹션",
        "실시간 통화, 전사, AI 에이전트 기반 답변 제안을 지원합니다.",
        "원활한 커뮤니케이션과 효율적인 세일즈 워크플로를 돕도록 설계했습니다.",
        "WebSocket과 OpenAI API(STT) 같은 실시간 통신 기능을 통합해 반응성 높은 사용자 경험을 제공합니다.",
      ],
      detailTitle: "Chat UI",
      imageAlt: "Sellpath 백엔드 연동 화면",
      title: "03 — Sellpath 상세 2",
    },
    sellpathOverview: {
      description: "미국 시장을 위한 AI 에이전트 기반 CRM 및 세일즈 플랫폼 개발에 기여했습니다.",
      features: [
        "세일즈 대시보드",
        "Activity Modal",
        "CRM 연동 테이블",
      ],
      featuresLabel: "주요 기능",
      mediaAlt: "Sellpath 프로젝트 스크린샷",
      projectNumber: "03",
      projectTitle: "Sellpath",
      subtitle: "프론트엔드 엔지니어로 2년간 근무했습니다.",
      techStack: [
        "Next.js",
        "React",
        "TypeScript",
        "OpenAI API",
        "WebSocket",
        "WebRTC",
      ],
      title: "03 — Sellpath",
    },
  },
};
