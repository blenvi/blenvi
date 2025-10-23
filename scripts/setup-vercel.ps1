# Vercel Setup Script for Blenvi Monorepo (PowerShell)
# This script helps you set up Vercel projects via CLI

Write-Host "🚀 Blenvi Vercel Setup Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI is installed (v$vercelVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel@latest
}

Write-Host ""
Write-Host "📦 Setting up Vercel projects..." -ForegroundColor Cyan
Write-Host ""

# Setup Web App
Write-Host "1️⃣  Setting up Web App" -ForegroundColor Yellow
Write-Host "   Navigate to: apps/web" -ForegroundColor Gray
Push-Location apps/web

Write-Host "   Running: vercel link" -ForegroundColor Gray
Write-Host "   Follow the prompts to link or create a new project" -ForegroundColor Magenta
vercel link

Pop-Location

Write-Host ""
Write-Host "2️⃣  Setting up Docs App" -ForegroundColor Yellow
Write-Host "   Navigate to: apps/docs" -ForegroundColor Gray
Push-Location apps/docs

Write-Host "   Running: vercel link" -ForegroundColor Gray
Write-Host "   Follow the prompts to link or create a new project" -ForegroundColor Magenta
vercel link

Pop-Location

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Configure environment variables in Vercel Dashboard" -ForegroundColor White
Write-Host "   2. Push to your main branch to trigger production deployment" -ForegroundColor White
Write-Host "   3. Create a PR to test preview deployments" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful commands:" -ForegroundColor Cyan
Write-Host "   vercel          - Deploy to preview" -ForegroundColor White
Write-Host "   vercel --prod   - Deploy to production" -ForegroundColor White
Write-Host "   vercel env ls   - List environment variables" -ForegroundColor White
Write-Host "   vercel logs     - View deployment logs" -ForegroundColor White
Write-Host ""
