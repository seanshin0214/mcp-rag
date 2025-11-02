# MCP-RAG 사용 방법

## 빠른 시작

### 1. ChromaDB 서버 실행 (필수!)

**새 터미널을 열고 계속 실행:**

```bash
chroma run --host localhost --port 8000
```

이 터미널은 **계속 열어두세요!**

---

### 2. 문서 추가 (CLI 사용)

#### 단일 파일 추가

```bash
cd C:\Users\sshin\Documents\mcp-rag

npm run cli add 컬렉션명 "파일경로"
```

**예시:**
```bash
npm run cli add Creativity_Innovation "C:\Users\sshin\Documents\5_Whys_Technique.docx"
```

#### 여러 파일 추가

**Windows (PowerShell):**
```powershell
cd C:\Users\sshin\Documents\mcp-rag

Get-ChildItem "C:\Users\sshin\Documents\creativity_docs\*.docx" | ForEach-Object {
    npm run cli add Creativity_Innovation $_.FullName
}
```

**Windows (CMD):**
```cmd
cd C:\Users\sshin\Documents\mcp-rag

for %f in ("C:\Users\sshin\Documents\creativity_docs\*.docx") do npm run cli add Creativity_Innovation "%f"
```

---

### 3. CLI 명령어

```bash
# 컬렉션 목록 보기
npm run cli list

# 컬렉션 정보 확인
npm run cli info Creativity_Innovation

# 검색 테스트
npm run cli search Creativity_Innovation "5 Whys"

# 컬렉션 삭제
npm run cli delete Creativity_Innovation
```

---

### 4. Claude Desktop에서 사용

Claude Desktop을 재시작한 후:

#### 검색
```
"Creativity_Innovation 컬렉션에서 5 Whys 기법에 대해 알려줘"
```

#### 컬렉션 확인
```
"내 MCP-RAG 컬렉션 목록 보여줘"
```

```
"Creativity_Innovation 컬렉션 정보 알려줘"
```

---

## 지원 파일 형식

- **문서**: PDF, DOCX (Word), HWP (한글), TXT, MD
- **프레젠테이션**: PPTX (PowerPoint)
- **스프레드시트**: XLSX, XLS (Excel)

---

## 폴더 구조

```
C:\Users\sshin\Documents\
├── mcp-rag\                    # MCP-RAG 프로젝트
│   ├── src\
│   ├── chroma\                 # ChromaDB 데이터 (자동 생성)
│   └── ...
└── creativity_docs\            # 추가할 문서들
    ├── file1.docx
    ├── file2.pptx
    └── ...
```

---

## 워크플로우

### Creativity & Innovation 수업 자료 추가하기

1. **파일 준비**
   ```
   모든 파일을 C:\Users\sshin\Documents\creativity_docs에 복사
   ```

2. **ChromaDB 서버 실행**
   ```bash
   chroma run --host localhost --port 8000
   ```

3. **파일 추가**
   ```powershell
   cd C:\Users\sshin\Documents\mcp-rag

   Get-ChildItem "C:\Users\sshin\Documents\creativity_docs\*.*" | ForEach-Object {
       npm run cli add Creativity_Innovation $_.FullName
   }
   ```

4. **확인**
   ```bash
   npm run cli info Creativity_Innovation
   ```

5. **Claude Desktop에서 질문**
   ```
   "Creativity_Innovation 컬렉션에서 혁신 전략에 대해 설명해줘"
   ```

---

## 문제 해결

### ChromaDB 연결 안 됨
```bash
# ChromaDB 서버가 실행 중인지 확인
curl http://localhost:8000/api/v1/heartbeat

# 실행되지 않았다면
chroma run --host localhost --port 8000
```

### 파일 추가 실패
- 파일 경로가 올바른지 확인
- 파일 형식이 지원되는지 확인 (PDF, DOCX, PPTX, XLSX, HWP, TXT, MD)
- ChromaDB 서버가 실행 중인지 확인

### Claude Desktop에서 안 보임
1. Claude Desktop 완전히 종료
2. `%APPDATA%\Claude\claude_desktop_config.json` 확인
3. ChromaDB 서버 실행 중 확인
4. Claude Desktop 재시작

---

## 팁

### 대량 파일 추가
```powershell
# DOCX, PPTX, PDF 모두 추가
Get-ChildItem "C:\path\*.docx","C:\path\*.pptx","C:\path\*.pdf" | ForEach-Object {
    npm run cli add MyCollection $_.FullName
}
```

### 진행 상황 확인
```bash
# 추가하면서 실시간 확인
npm run cli info Creativity_Innovation
```

### 빠른 검색 테스트
```bash
# CLI에서 빠르게 테스트
npm run cli search Creativity_Innovation "검색어"
```

---

## Desktop Commander 활용

Claude Desktop에서 Desktop Commander를 사용해서 파일 추가:

```
"C:\Users\sshin\Documents\mcp-rag 폴더로 이동해서
다음 명령 실행:

npm run cli add Creativity_Innovation "C:\path\to\file.docx"
"
```

여러 파일:
```
"PowerShell에서 실행:
cd C:\Users\sshin\Documents\mcp-rag
Get-ChildItem 'C:\creativity_docs\*.docx' | ForEach-Object {
    npm run cli add Creativity_Innovation $_.FullName
}"
```

---

## 요약

1. ✅ **ChromaDB 서버 실행** (항상!)
2. ✅ **CLI로 문서 추가** (`npm run cli add`)
3. ✅ **Claude Desktop에서 검색** (자동으로 MCP 도구 사용)

**문서 추가 = CLI만**
**검색 = Claude Desktop**
