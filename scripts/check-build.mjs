import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('dist')
const html = await readFile(path.join(root, 'index.html'), 'utf8')
assert.match(html, /<html lang="ko">/)
assert.match(html, /<title>자취방 설명서<\/title>/)
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1])
assert.ok(assets.some(asset => asset.endsWith('.js')), '빌드 JS가 필요합니다.')
assert.ok(assets.some(asset => asset.endsWith('.css')), '빌드 CSS가 필요합니다.')
for (const asset of assets) assert.ok((await stat(path.join(root, asset))).isFile(), asset)
const files = await readdir(path.join(root, 'assets'))
assert.ok(!files.some(file => /UiPreviewPage|LayoutPreviewPage/.test(file)), '개발 전용 페이지가 별도 배포 번들에 포함됐습니다.')
console.log(`빌드 HTML·언어·제목·정적 파일 ${assets.length}개 확인 완료`)
