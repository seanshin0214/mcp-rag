@echo off
chcp 65001 >nul
echo ========================================
echo MCP-RAG 설치 스크립트
echo ========================================
echo.

REM Node.js 확인
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo.
    echo Node.js를 먼저 설치해주세요: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 확인 완료
node --version
echo.

REM npm 패키지 설치
echo 📦 패키지 설치 중...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 패키지 설치 실패
    pause
    exit /b 1
)

echo.
echo ✅ 패키지 설치 완료!
echo.

REM Python 확인
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Python이 설치되어 있지 않습니다.
    echo.
    echo ChromaDB를 사용하려면 Python이 필요합니다.
    echo Python 설치: https://www.python.org/downloads/
    echo.
    set /p CONTINUE="Python 없이 계속하시겠습니까? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
) else (
    echo ✅ Python 확인 완료
    python --version
    echo.

    REM ChromaDB 설치 확인
    python -c "import chromadb" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo 📦 ChromaDB 설치 중...
        pip install chromadb
        if %ERRORLEVEL% NEQ 0 (
            echo ⚠️ ChromaDB 설치 실패
            echo 수동으로 설치하세요: pip install chromadb
        ) else (
            echo ✅ ChromaDB 설치 완료!
        )
    ) else (
        echo ✅ ChromaDB 이미 설치됨
    )
)

echo.
echo ========================================
echo 설치 완료!
echo ========================================
echo.
echo 다음 단계:
echo.
echo 1. ChromaDB 서버 실행:
echo    chroma run --host localhost --port 8000
echo.
echo 2. 문서 추가:
echo    npm run cli add 컬렉션명 문서.pdf
echo.
echo 3. Claude Desktop 설정:
echo    %%APPDATA%%\Claude\claude_desktop_config.json
echo.
echo    {
echo      "mcpServers": {
echo        "mcp-rag": {
echo          "command": "node",
echo          "args": ["%CD%\src\index.js"]
echo        }
echo      }
echo    }
echo.
echo 4. Claude Desktop 재시작
echo.
echo 자세한 내용은 README.md를 참고하세요.
echo.
pause
