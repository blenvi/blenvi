#!/bin/bash

# Vercel Setup Script for Blenvi Monorepo
# This script helps you set up Vercel projects via CLI

echo "🚀 Blenvi Vercel Setup Script"
echo "=============================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
else
    echo "✅ Vercel CLI is installed"
fi

echo ""
echo "📦 Setting up Vercel projects..."
echo ""

# Setup Web App
echo "1️⃣  Setting up Web App"
echo "   Navigate to: apps/web"
cd apps/web || exit

echo "   Running: vercel link"
echo "   Follow the prompts to link or create a new project"
vercel link

cd ../..

echo ""
echo "2️⃣  Setting up Docs App"
echo "   Navigate to: apps/docs"
cd apps/docs || exit

echo "   Running: vercel link"
echo "   Follow the prompts to link or create a new project"
vercel link

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Configure environment variables in Vercel Dashboard"
echo "   2. Push to your main branch to trigger production deployment"
echo "   3. Create a PR to test preview deployments"
echo ""
echo "🔗 Useful commands:"
echo "   vercel          - Deploy to preview"
echo "   vercel --prod   - Deploy to production"
echo "   vercel env ls   - List environment variables"
echo "   vercel logs     - View deployment logs"
echo ""
