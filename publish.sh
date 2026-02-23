#!/bin/bash
# HDEX 매출 대시보드 GitHub Pages 배포 스크립트
# 사용법: ./publish.sh GITHUB_USERNAME
# 예: ./publish.sh kimym-df

USER="${1:-kimym-df}"
REPO="hdex-sales-dashboard"
URL="https://github.com/${USER}/${REPO}.git"

echo "=== HDEX 매출 대시보드 배포 ==="
echo "대상: ${URL}"
echo ""

if ! git remote get-url origin 2>/dev/null; then
    git remote add origin "$URL"
    echo "Remote 추가됨: origin -> $URL"
fi

echo ""
echo "푸시 중..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 푸시 완료!"
    echo ""
    echo "📌 다음 단계:"
    echo "   1. https://github.com/${USER}/${REPO}/settings/pages 접속"
    echo "   2. Source: Deploy from a branch"
    echo "   3. Branch: main / (root) 선택 후 Save"
    echo ""
    echo "🌐 배포 후 접속 URL:"
    echo "   https://${USER}.github.io/${REPO}/"
    echo ""
else
    echo ""
    echo "❌ 푸시 실패. 아래를 확인하세요:"
    echo "   - GitHub에 ${REPO} 저장소가 생성되었는지"
    echo "   - ${USER} 사용자명이 맞는지"
    echo "   - git credential이 설정되었는지"
    echo ""
    echo "저장소가 없다면: https://github.com/new 에서 생성하세요"
fi
