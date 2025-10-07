#!/bin/bash

# 장르 시드 데이터 적용 스크립트

echo "🎨 장르 시드 데이터를 추가합니다..."

# 인덱스 migration 적용
echo "📊 Step 1: 인덱스 추가..."
npx supabase db push --migration-file supabase/migrations/010_add_genre_indexes.sql

# 시드 데이터 migration 적용
echo "🌱 Step 2: 시드 데이터 추가..."
npx supabase db push --migration-file supabase/migrations/011_seed_genre_artworks.sql

echo "✅ 시드 데이터 추가 완료!"
echo ""
echo "📈 데이터 확인:"
echo "npm run dev를 실행한 후 다음 페이지를 확인하세요:"
echo "  - http://localhost:3000/genres (장르 목록)"
echo "  - http://localhost:3000/genres/painting (회화 작품)"
echo "  - http://localhost:3000/genres/digital-art (디지털 아트)"
echo "  - http://localhost:3000/genres/furniture (가구)"
