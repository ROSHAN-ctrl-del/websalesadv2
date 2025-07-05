# MongoDB Starter Script for Windows
Write-Host "🚀 Starting MongoDB and Sales Management System..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB service exists
$service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "📋 Found MongoDB service, attempting to start..." -ForegroundColor Yellow
    
    if ($service.Status -eq "Running") {
        Write-Host "✅ MongoDB service is already running!" -ForegroundColor Green
    } else {
        try {
            Start-Service -Name "MongoDB"
            Write-Host "✅ MongoDB service started successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start MongoDB service. Please run as Administrator." -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Try running PowerShell as Administrator and execute:" -ForegroundColor Yellow
            Write-Host "   net start MongoDB" -ForegroundColor Cyan
            exit 1
        }
    }
} else {
    Write-Host "⚠️  MongoDB service not found. Please ensure MongoDB is installed." -ForegroundColor Yellow
    Write-Host "📥 Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 If MongoDB is installed but service doesn't exist, try:" -ForegroundColor Yellow
    Write-Host "   'C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe' --install" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🔗 MongoDB Connection Information:" -ForegroundColor Cyan
Write-Host "   Connection String: mongodb://localhost:27017" -ForegroundColor White
Write-Host "   Database: sales-management" -ForegroundColor White
Write-Host "   Port: 27017" -ForegroundColor White
Write-Host ""

Write-Host "📊 MongoDB Compass Setup:" -ForegroundColor Cyan
Write-Host "   1. Open MongoDB Compass" -ForegroundColor White
Write-Host "   2. Click 'New Connection'" -ForegroundColor White
Write-Host "   3. Enter: mongodb://localhost:27017" -ForegroundColor White
Write-Host "   4. Click 'Connect'" -ForegroundColor White
Write-Host "   5. Navigate to 'sales-management' database" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Testing MongoDB connection..." -ForegroundColor Yellow
try {
    npm run test:mongodb
    Write-Host ""
    Write-Host "🎉 MongoDB is ready! You can now:" -ForegroundColor Green
    Write-Host "   • Connect with MongoDB Compass" -ForegroundColor White
    Write-Host "   • Start your application with: npm run mongodb:start" -ForegroundColor White
} catch {
    Write-Host "❌ MongoDB connection test failed. Please check the error above." -ForegroundColor Red
} 