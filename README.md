# 별빛 우편국

중학교 1학년 「순서쌍과 좌표」를 바탕으로 만든 12개 항로의 2D 배달 퍼즐입니다.
목적지의 (x, y)를 입력하고, 가로/세로 이동 순서를 선택해 편지를 모은 뒤 우편함에 도착합니다.
모든 칸 이동에 연료 1이 필요하며 폭풍은 통과할 수 없습니다. 경유지를 자유롭게 정할 수 있습니다.

## 실행

Node.js 20 이상에서 별도 패키지 설치 없이 실행합니다.

```sh
npm start
npm test
npm run build
```

실행 주소는 http://127.0.0.1:4173/ 입니다. `dist/`는 정적 호스팅에 바로 배포할 수 있습니다.

## 구성

- `engine.mjs`: 순수 수학·이동·승리 판정과 독립 BFS 경로 탐색
- `levels.mjs`: 12개 스테이지
- `app.mjs`, `style.css`: 입력, SVG 좌표평면, 비행 애니메이션, 저장, 힌트, 효과음
- `tests/`: 좌표쌍 전수 검사, 전체 스테이지 완주, 장애물·연료·수거 검증
- `design.json`, `sources.json`: 기획과 교과서 근거
- `assets/`: 직접 생성한 배경·투명 비행선 이미지
- `evidence/`, `verification.json`: 검증 기록

## 학습 범위

미래엔 중학교 수학 1 「순서쌍과 좌표」 111~113쪽의 개념을 사용했습니다.
정수 좌표만 다루며 분수·소수 좌표는 포함하지 않습니다. 교과서 PDF나 원문 삽화는 이 저장소에 없습니다.
재미와 실제 학습효과는 학생 피드백으로 추가 확인해야 합니다.

## 저장과 별

브라우저의 localStorage에 최고 별점과 마지막 항로를 저장합니다. 네트워크로 학생 정보를 보내지 않습니다.
최단 거리, 잘못된 출발·되돌리기·힌트 없이 완주하면 별 3개입니다. 힌트를 2회 이상 쓰면 최대 별 1개입니다.

각 게임은 독립 GitHub 저장소로 관리하고, 모음 사이트는 별도의 `math-game-arcade` 프로젝트로 관리합니다.

## Vercel 배포와 에셋 개편

이 저장소를 Vercel에서 Import합니다. Framework Other, Build npm run build, Output dist가 vercel.json에 설정되어 있습니다. build-info.json은 배포 커밋 확인용입니다. 기존 ChatGPT Sites 주소로 연결하지 않습니다.

편지, 폭풍, 우편함은 내장 image_gen으로 만든 assets/postal-props.png를 사용합니다. SVG는 아틀라스의 영역과 정확한 좌표만 배치합니다. 프롬프트는 assets/prompts.json의 upgrade 항목에 있습니다.
