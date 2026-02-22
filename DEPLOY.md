# HDEX 매출 대시보드 배포 가이드 (GitHub Pages)

## 1. GitHub 저장소 만들기

1. https://github.com/new 접속
2. **Repository name:** `hdex-sales-dashboard` (또는 원하는 이름)
3. **Public** 선택
4. **Create repository** 클릭 (README, .gitignore 추가하지 않음)

---

## 2. 로컬에서 푸시

터미널에서 실행:

```bash
cd /Users/df_ym1/hdex-sales-dashboard

git add index.html README.md
git commit -m "HDEX 매출 분석 대시보드"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hdex-sales-dashboard.git
git push -u origin main
```

> `YOUR_USERNAME`을 본인 GitHub 사용자명으로 변경하세요.  
> (예: kimym-df)

---

## 3. GitHub Pages 활성화

1. GitHub 저장소 페이지에서 **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** main / (root) 선택
4. **Save** 클릭

몇 분 후 아래 주소로 접속 가능합니다:

```
https://YOUR_USERNAME.github.io/hdex-sales-dashboard/
```

예: `https://kimym-df.github.io/hdex-sales-dashboard/`

---

## 4. 이후 업데이트

```bash
cd /Users/df_ym1/hdex-sales-dashboard
git add .
git commit -m "업데이트 내용"
git push
```

푸시 후 1~2분 내에 배포 반영됩니다.
