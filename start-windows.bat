@echo off
echo 🐳 QuoteCompare Docker Setup for Windows
echo ========================================

echo.
echo Checking if Docker is running...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not running!
    echo Please install Docker Desktop for Windows and make sure it's running.
    echo Download from: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

echo ✅ Docker is installed and running!
echo.

echo Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo ⚠️  Please edit .env file and add your API keys before proceeding!
    echo.
    echo Required API keys:
    echo - PINECONE_API_KEY
    echo - OPENROUTER_API_KEY  
    echo - MISTRAL_API_KEY
    echo.
    echo Press any key when you've added your API keys...
    pause >nul
)

echo.
echo 🚀 Building and starting all services...
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 🗄️  Setting up database...
docker-compose exec -T backend npx prisma migrate deploy
docker-compose exec -T backend npx prisma generate

echo.
echo ✅ Setup complete!
echo.
echo 🌐 Your application is now running at:
echo   Frontend: http://localhost
echo   Backend:  http://localhost:3000
echo   
echo 📊 To view logs:
echo   docker-compose logs -f
echo.
echo 🛑 To stop the application:
echo   docker-compose down
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost