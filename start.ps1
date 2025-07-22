Write-Host "🚀 Nextt - Plex-Powered Recommendation Dashboard" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Starting Nextt..." -ForegroundColor Green
Write-Host "📊 Backend will run on: http://localhost:3001" -ForegroundColor Yellow
Write-Host "🌐 Frontend will run on: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Starting servers..." -ForegroundColor Green
Write-Host ""

try {
    # Start both servers
    npm run dev:full
}
catch {
    Write-Host "❌ Error starting Nextt: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure you have Node.js installed and are in the project directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
} 