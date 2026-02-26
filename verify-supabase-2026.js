#!/usr/bin/env node
/**
 * Supabase 2026 매장별 매출 조회 및 대시보드 로직 검증 스크립트
 * 실행: node verify-supabase-2026.js
 */

const SUPABASE_URL = 'https://nrfeorrwdjzzgpvwqtql.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZmVvcnJ3ZGp6emdwdndxdHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNjEzODEsImV4cCI6MjA4MjYzNzM4MX0.jovOet82RUuDnReU-UbA-QWTmxlX7FFcGbQqDZT8TLc';

const HDEX_STORE_NAMES_2026 = [
  '더현대 서울', '롯데몰 잠실', '타임빌라스 수원', '신세계 센텀시티몰', '신세계 광주', '신세계 강남',
  '현대 중동', '더현대 대구', '현대 울산', 'HYM DOSAN', '롯데 부산본점', '롯데 기흥아울렛',
  '롯데 동부산아울렛', '현대 커넥트 청주', '현대 송도아울렛', 'HDEX 홍대', 'HDEX 한남', 'HDEX 한남 우먼', '스타필드 수원'
];

async function sbFetch(params) {
  const url = `${SUPABASE_URL}/rest/v1/sales_online?${params}`;
  const res = await fetch(url, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase API error: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchAll2026() {
  const startDate = '2026-01-01';
  const endDate = '2026-12-31';
  const storeFilter = 'store_name=in.(' + HDEX_STORE_NAMES_2026.map(s => `"${s}"`).join(',') + ')';
  let allRows = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const data = await sbFetch(
      `select=sale_date,store_name,sale_quantity,actual_sale_amount` +
      `&sale_date=gte.${startDate}&sale_date=lte.${endDate}` +
      `&${storeFilter}` +
      `&order=sale_date.asc&limit=${pageSize}&offset=${offset}`
    );
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    offset += pageSize;
    if (data.length < pageSize) break;
  }
  return allRows;
}

function aggregateByStoreMonth(rows) {
  const agg = {};
  rows.forEach(row => {
    const store = row.store_name;
    if (!HDEX_STORE_NAMES_2026.includes(store)) return;
    const month = row.sale_date ? row.sale_date.substring(0, 7) : 'unknown';
    const key = `${store}|${month}`;
    if (!agg[key]) agg[key] = { store, month, totalSales: 0, totalQty: 0 };
    agg[key].totalSales += (row.actual_sale_amount || 0);
    agg[key].totalQty += (row.sale_quantity || 0);
  });
  return Object.values(agg);
}

function aggregateByStoreDate(rows) {
  const agg = {};
  rows.forEach(row => {
    const store = row.store_name;
    if (!HDEX_STORE_NAMES_2026.includes(store)) return;
    const date = row.sale_date ? row.sale_date.substring(0, 10) : null;
    if (!date) return;
    const key = `${date}|${store}`;
    if (!agg[key]) agg[key] = { date, store, totalSales: 0 };
    agg[key].totalSales += (row.actual_sale_amount || 0);
  });
  return agg;
}

async function main() {
  console.log('=== Supabase 2026 매장별 매출 조회 및 검증 ===\n');

  const rows = await fetchAll2026();
  console.log(`총 조회 건수: ${rows.length}건\n`);

  if (rows.length === 0) {
    console.log('데이터가 없습니다. Supabase에 2026년 데이터가 있는지 확인하세요.');
    process.exit(1);
  }

  // 매장별 월별 집계 (보정 전)
  const monthly = aggregateByStoreMonth(rows);

  // 매장별 총 매출
  const storeTotals = {};
  monthly.forEach(d => {
    storeTotals[d.store] = (storeTotals[d.store] || 0) + d.totalSales;
  });

  console.log('--- 매장별 2026 연간 매출 (Supabase 원시 합계) ---');
  const sorted = Object.entries(storeTotals).sort((a, b) => b[1] - a[1]);
  let grandTotal = 0;
  sorted.forEach(([store, total]) => {
    grandTotal += total;
    console.log(`  ${store}: ${total.toLocaleString()}원`);
  });
  console.log(`  [합계] ${grandTotal.toLocaleString()}원\n`);

  // 2월 매장별
  const feb2026 = monthly.filter(d => d.month === '2026-02');
  const febByStore = {};
  feb2026.forEach(d => { febByStore[d.store] = d.totalSales; });
  const febTotal = Object.values(febByStore).reduce((a, b) => a + b, 0);
  console.log('--- 2026년 2월 매장별 매출 ---');
  Object.entries(febByStore).sort((a, b) => b[1] - a[1]).forEach(([s, v]) => {
    console.log(`  ${s}: ${v.toLocaleString()}원`);
  });
  console.log(`  [2월 합계] ${febTotal.toLocaleString()}원\n`);

  // 2/22 일별
  const daily0222 = aggregateByStoreDate(rows);
  const keys0222 = Object.keys(daily0222).filter(k => k.startsWith('2026-02-22'));
  if (keys0222.length > 0) {
    console.log('--- 2026-02-22 매장별 매출 ---');
    let dayTotal = 0;
    keys0222.sort().forEach(key => {
      const val = daily0222[key].totalSales;
      dayTotal += val;
      console.log(`  ${key.split('|')[1]}: ${val.toLocaleString()}원`);
    });
    console.log(`  [2/22 합계] ${dayTotal.toLocaleString()}원\n`);
  } else {
    console.log('--- 2026-02-22: 데이터 없음 ---\n');
  }

  // unique store names in Supabase
  const uniqueStores = [...new Set(rows.map(r => r.store_name))];
  console.log('--- Supabase에 있는 매장명 ---');
  uniqueStores.sort().forEach(s => console.log(`  ${s}`));

  const notInList = uniqueStores.filter(s => !HDEX_STORE_NAMES_2026.includes(s));
  if (notInList.length > 0) {
    console.log('\n⚠️  HDEX_STORE_NAMES_2026에 없는 매장 (집계 제외됨):', notInList.join(', '));
  }

  console.log('\n=== 검증 완료 (대시보드와 동일 로직 적용) ===');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
