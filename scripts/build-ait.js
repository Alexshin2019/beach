import archiver from 'archiver';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { readFileSync } from 'fs';
import { join, dirname, resolve, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { readdir, stat } from 'fs/promises';

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트 경로 (scripts 폴더의 상위 디렉토리)
const projectRoot = resolve(__dirname, '..');
const distPath = join(projectRoot, 'dist');
const outputPath = join(projectRoot, 'dist');

// package.json에서 서비스명 가져오기
const packageJsonPath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const serviceName = packageJson.name || 'app';
const aitFileName = `${serviceName}.ait`;
const aitFilePath = join(projectRoot, aitFileName);

/**
 * 디렉토리 내의 모든 파일을 재귀적으로 가져오기
 */
async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = await readdir(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }

  return arrayOfFiles;
}

/**
 * .ait 파일 생성 (dist 폴더를 zip으로 압축)
 */
async function createAitFile() {
  // dist 폴더가 존재하는지 확인
  if (!existsSync(distPath)) {
    console.error('❌ dist 폴더를 찾을 수 없습니다. 먼저 빌드를 실행하세요: npm run build');
    process.exit(1);
  }

  console.log('📦 .ait 파일 생성 중...');
  console.log(`   소스: ${distPath}`);
  console.log(`   출력: ${aitFilePath}`);

  // 출력 디렉토리가 없으면 생성
  const outputDir = dirname(aitFilePath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 기존 .ait 파일이 있으면 삭제
  if (existsSync(aitFilePath)) {
    unlinkSync(aitFilePath);
    console.log('   기존 .ait 파일 삭제됨');
  }

  // zip 아카이버 생성
  const output = createWriteStream(aitFilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // 최대 압축 레벨
  });

  return new Promise((resolve, reject) => {
    // 이벤트 핸들러
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ .ait 파일 생성 완료!`);
      console.log(`   파일명: ${aitFileName}`);
      console.log(`   크기: ${sizeInMB} MB`);
      console.log(`   위치: ${aitFilePath}`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('❌ 압축 중 오류 발생:', err);
      reject(err);
    });

    // 파이프 연결
    archive.pipe(output);

    // dist 폴더의 모든 파일 가져오기
    getAllFiles(distPath).then((files) => {
      // 각 파일을 아카이브에 추가 (dist 폴더 기준 상대 경로 사용)
      files.forEach((file) => {
        // path.relative를 사용하여 상대 경로 계산 (크로스 플랫폼 지원)
        const relativePath = relative(distPath, file).split(sep).join('/');
        archive.file(file, { name: relativePath });
      });

      // 아카이브 완료
      archive.finalize();
    }).catch((err) => {
      console.error('❌ 파일 읽기 중 오류 발생:', err);
      reject(err);
    });
  });
}

// 스크립트 실행
createAitFile().catch((error) => {
  console.error('❌ .ait 파일 생성 실패:', error);
  process.exit(1);
});

