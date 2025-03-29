# NovelAI Prompt Completion Extension

**크롬 확장 프로그램**으로 NovelAI 이미지 생성 시 **자동 프롬프트 완성** 기능을 제공합니다.  
chatgpt-4o-latest, deepseek-chat 등 LLM을 활용해 자연어 설명 → Danbooru 스타일 태그 변환

## ✨ 주요 기능

- **자동 태그 생성**  
  나히다와 클레가 벤치에 앉아있는 장면
  ```
  masterpiece, best quality, 2girl, nahida (genshin impact), klee (genshin impact), green hair, white hair, red eyes, yellow eyes, short hair, long hair, cute, child, light skin, hood, white dress, red coat, backpack, sitting, bench, outdoors, park, trees, sunlight, looking at viewer, full body, depth of field, soft lighting, bokeh
  ```
- **이미지 분석 지원** (멀티모달)  
  업로드한 이미지 분석 후 태그 추출
- **단축키 지원**  
  `Ctrl+Enter`로 빠른 생성

## 🛠 설치 방법

1. **저장소 클론**:
   ```bash
   git clone https://github.com/ouor/NovelAICompletion.git
   ```
2. **크롬 확장 프로그램 페이지** 이동:  
   `chrome://extensions/`
3. **개발자 모드** 활성화 → **압축 해제된 확장 프로그램 로드** 선택

## ⚙️ 설정 가이드

옵션 페이지에서 원하는 LLM 설정

- chatgpt-4o-latest (추천 구성)
```
baseUrl = 'https://api.openai.com/v1/chat/completions'
modelName = 'chatgpt-4o-latest'
apiKey = 'sk-your-api-key'
```
- deepseek-chat (**이미지 분석을 지원하지 않습니다**)
```
baseUrl = 'https://api.deepseek.com/chat/completions'
modelName = 'deepseek-chat'
apiKey = 'sk-your-api-key'
```