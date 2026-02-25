# Dango (당고) Project

<img src="frontend/public/dango.svg" alt="Dango Logo" width="150"/>

**Dango**는 효율적인 외국어 단어 학습을 위한 **간격 반복 시스템(SRS, Spaced Repetition System)** 기반의 학습 플랫폼입니다.
사용자는 자신만의 단어장을 생성하고, 과학적인 복습 알고리즘을 통해 체계적으로 암기 효율을 극대화할 수 있습니다.

## 🏗 시스템 아키텍처 (System Architecture)

```mermaid
graph TD
    User[사용자 (User)] -->|Web Browser| Frontend[React Frontend]
    Frontend -->|REST API| Backend[Spring Boot Backend]
    Backend -->|read/write| DB[(Database)]
    Backend -->|Calculate| Algorithm[SRS Algorithm Service]
```

## 🚀 주요 기능 (Features)

*   **스마트한 복습 시스템 (SRS)**
    *   사용자의 학습 성취도에 따라 복습 주기를 자동으로 최적화합니다.
    *   다양한 학습 알고리즘(SM-2 등)을 지원하며, 덱별로 맞춤 설정이 가능합니다.
*   **나만의 단어장 (Custom Decks)**
    *   학습하고 싶은 단어와 예문, 설명을 자유롭게 추가하여 나만의 단어장을 만듭니다.
*   **다국어 지원 (Full Localization)**
    *   한국어, 일본어, 영어 등 다양한 언어 인터페이스를 지원하여 누구나 쉽게 접근할 수 있습니다.
*   **학습 관리 및 통계**
    *   일일 학습량 제한 설정으로 꾸준한 학습 습관을 형성합니다.
    *   히트맵(Heatmap) 등을 통해 학습 진척도를 시각적으로 확인합니다.
*   **커뮤니티 & 공지사항**
    *   학습 팁 공유 및 공지사항 확인을 위한 게시판 기능을 제공합니다.

## 🛠 기술 스택 (Tech Stack)

### Frontend
*   **Core**: React 19, TypeScript
*   **Build Tool**: Vite
*   **State & Routing**: React Router
*   **Internationalization**: i18next
*   **Utility**: Axios, React Markdown

### Backend
*   **Core**: Java, Spring Boot
*   **Database**: (MySQL/H2 - 설정에 따라 다름)
*   **ORM**: JPA / Hibernate

## 📝 프로젝트 소개

이 프로젝트는 기존의 `jpcard`에서 발전하여, 더 범용적이고 체계적인 단어 학습 경험을 제공하기 위해 **Dango**라는 이름으로 새롭게 단장하였습니다. 단순한 암기를 넘어, 사용자가 학습의 즐거움을 느끼고 지속적으로 성장할 수 있도록 돕는 것을 목표로 합니다.
