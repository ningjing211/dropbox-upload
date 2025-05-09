// 這是從 upload.js 複製來的基礎架構，準備做批次上傳
const fs = require('fs');
const path = require('path');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

// Dropbox 初始化
const dbx = new Dropbox({
    accessToken: 'sl.u.AFteZaANZfpTw8Ooy2zWMq29GLDNcvbccQGP9m-1VgWLH5kS4yUGpGpPAsQV9Bl2n3m17SrsJfMiW2KMciZArQA6hel37FDpW62CaXZV3anwZzLGdw7_kC0y1Mdn_LAa5SH3i0gVdANfpz4AkoE8YVosk8uhQbnlsPlWBdD5w7FSnrjTQpfI3DYXLCJ0y25l2XqQIq50RL9gSZ_PZ-WCO9IMdblm3Q4zwGUkW0Gde8P97OwnSG3VHYs9OelTOPBheBFILcjeP7Q8pbejtYshHSHwAuAekFarbkQRXLqSlgVJUgHEzd1a-Cc3LCONpDQu130MpGhyDEfwmugPq13aWoEkU72Ups6nko2Z7xs407SZEJjdP6PjlOtBU3-h_oOda_eh4CWoNgOrBHeYK4XW_OLVGw7CKVpLqiivwjdv80c_TMtNLUy6vG0ojhOKNrpwHB7cirD7MzA-oGkN6VDjSQSjZrWCmugfoPD9hor0YSXwkl2g1c8Liyy4ysP5UmqM7WZLh7MocW8CJUQ-uCCCQvXeI733QsBPNa6x3qIrcJLTe6PWLwQy6HXDgz9ZwaIVKfOhNzxPr1uw4WgnJKQANvgm8dZBpjlmW2qJnFvnxruHdalH7ZBgJ23HmDSm7XGuSDtypxMRFdU08oQ2POpx0K5xgxB3mb-jJxcVBoNafmA7GuyoaljVtd08r739Dj_kr1k_eENmOuvUCKZmmWjEpck5NmT-qXYXlQ4MBBuk2uUk5erYbdwbJF1wRabas8A-k27RMEiVI-6arvL89kIKZfOcw-T8msEjMEXnOdWASVxrmF7JCJFMUYTUnmEkVFGdhe0pqQRRdoiCHiNfqtSPx6Xfs5G3aY3Rsp8hT0cv5asgRto_jooOPAyHZEMd_3VkAnuymDlKC3RGoum_QQKHJ-9FGSjkbBOSAxfGQiiseC1q1iUNTSYUAJniyL0N3lMhTzo-8YHa_7KV8VIz0T01POR3l4DtXcK_wOObsNvVqsyan_liAS-v8__WbfU514iHFE-rmTLL96B3QP-PVNub84gWR3bSPnNgsvn9jlxhy0bTt3nxmln1QANTjGsDtK9oAMAHOi2EsvzE1sSQQ5diUGZugbahFhFvwjRm-Z79QSSaOicmtyYUN82yKiCer-g5DvS0_2OmWwrDFN6puuujQaCRLuy-kdPaBG55BVUJkkcH4ENoFs0XAI4DCujxkV2vKpp0UPPFkfHgUTEmjfu-U4PkMorqusOTIhCjzBC_yHoGBsWFcm6S-aOtG3C3yMO4aliiYXMZsERjCzJbn7d8afVsZuaAKtTQfL9KR7BaEsxGvAvRwGOBCzH7pNR9SN46Lb84nrrIb_acr6jha0Sxl5d4_rXKdq2YiG0PGrPLDKs5fKMK1S_eiAhqi5mLy6lhiS6w_0JJA7X_-fJJQRp1KYE7YhOE8FPSp85-Zhbs4yB1rm6n5VVQTCSDB7Rjaj2kqkkmlARrTQR41Ftok_Mqo7TSQEJ6mn46Aylxc79_d8pOgDNXzZ5BlZpiOfz-XgPS43FGw7zZeucQGU9s-_fP76xp',
    fetch
});

// 目標資料夾
const baseDir = '/Users/flowasitgoes/DJ';
const movFiles = [];

// 只抓 46_ ~ 62_ 開頭的資料夾
const folders = fs.readdirSync(baseDir).filter(f => {
    const fullPath = path.join(baseDir, f);
    if (!fs.statSync(fullPath).isDirectory()) return false;
    const match = f.match(/^([0-9]{2})_/);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num >= 46 && num <= 62;
});

// 遍歷每個資料夾，找出 .mov 檔案
folders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mov'));
    files.forEach(file => {
        // 產生新檔名 05_檔名.mov
        const newName = `${folder.substring(0,2)}_${file}`;
        movFiles.push({
            local: path.join(folderPath, file),
            uploadName: newName
        });
    });
});

// 列出所有需要上傳的檔案路徑
console.log('需要上傳的檔案：');
movFiles.forEach(f => {
    console.log(`${f.local}  ->  ${f.uploadName}`);
});

// 上傳相關函數複製自 upload.js
function formatTime(date) {
    return date.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

function getTimeDiff(start, end) {
    const diff = end - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}小時${minutes}分${seconds}秒`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getChunkStream(filePath, start, end) {
    return fs.createReadStream(filePath, { start, end });
}

async function uploadChunks(filePath, dropboxPath, sessionId, start, end, fileSize, chunkLength) {
    if (start >= fileSize) {
        console.log('所有分塊上傳完成，正在結束會話...');
        return await dbx.filesUploadSessionFinish({
            cursor: {
                session_id: sessionId,
                offset: fileSize
            },
            commit: {
                path: dropboxPath,
                mode: { '.tag': 'overwrite' }
            }
        });
    }
    if (end >= fileSize) {
        end = fileSize - 1;
    }
    const chunkStream = getChunkStream(filePath, start, end);
    const currentChunkSize = end - start + 1;
    console.log(`上傳分塊：${formatFileSize(start)} - ${formatFileSize(end)} (${formatFileSize(currentChunkSize)})`);
    await dbx.filesUploadSessionAppendV2({
        cursor: {
            session_id: sessionId,
            offset: start
        },
        close: false,
        contents: chunkStream
    });
    const progress = ((start + currentChunkSize) / fileSize * 100).toFixed(2);
    console.log(`上傳進度: ${progress}% (${formatFileSize(start + currentChunkSize)} / ${formatFileSize(fileSize)})`);
    return await uploadChunks(filePath, dropboxPath, sessionId, end + 1, end + 1 + chunkLength, fileSize, chunkLength);
}

async function uploadLargeFile(filePath, dropboxPath) {
    const startTime = new Date();
    const fileSize = fs.statSync(filePath).size;
    const CHUNK_SIZE = 8 * 1024 * 1024;
    console.log(`\n開始上傳大文件`);
    console.log(`開始時間: ${formatTime(startTime)} (台灣時間)`);
    console.log(`文件路徑: ${filePath} -> ${dropboxPath}`);
    console.log(`文件大小: ${formatFileSize(fileSize)}`);
    console.log(`分塊大小: ${formatFileSize(CHUNK_SIZE)}`);
    try {
        console.log('開始上傳會話...');
        const firstChunkStream = getChunkStream(filePath, 0, Math.min(CHUNK_SIZE - 1, fileSize - 1));
        const sessionStart = await dbx.filesUploadSessionStart({
            close: false,
            contents: firstChunkStream
        });
        console.log(`會話開始成功，會話ID: ${sessionStart.result.session_id}`);
        await uploadChunks(
            filePath,
            dropboxPath,
            sessionStart.result.session_id,
            CHUNK_SIZE,
            CHUNK_SIZE * 2 - 1,
            fileSize,
            CHUNK_SIZE
        );
        const endTime = new Date();
        console.log(`\n上傳完成: ${path.basename(filePath)}`);
        console.log(`結束時間: ${formatTime(endTime)} (台灣時間)`);
        console.log(`總耗時: ${getTimeDiff(startTime, endTime)}`);
        console.log('----------------------------------------');
        return true;
    } catch (error) {
        const endTime = new Date();
        console.error(`\n上傳失敗: ${filePath}`);
        console.error(`開始時間: ${formatTime(startTime)} (台灣時間)`);
        console.error(`結束時間: ${formatTime(endTime)} (台灣時間)`);
        console.error(`總耗時: ${getTimeDiff(startTime, endTime)}`);
        console.error(`錯誤信息:`, error);
        throw error;
    }
}

async function saveSharedLink(dropboxPath, localFileName) {
    try {
        const res = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
        let url = res.result.url;
        if (url.endsWith('?dl=0')) {
            url = url.replace('?dl=0', '?dl=1');
        } else if (!url.endsWith('?dl=1')) {
            url += '?dl=1';
        }
        const line = `${localFileName}\n${url}\n\n`;
        fs.appendFileSync('link.txt', line);
        console.log(`已寫入 link.txt: ${line}`);
    } catch (e) {
        if (e.error && e.error.error && e.error.error['.tag'] === 'shared_link_already_exists') {
            const res = await dbx.sharingListSharedLinks({ path: dropboxPath, direct_only: true });
            if (res.result && res.result.links && res.result.links.length > 0) {
                let url = res.result.links[0].url;
                if (url.endsWith('?dl=0')) {
                    url = url.replace('?dl=0', '?dl=1');
                } else if (!url.endsWith('?dl=1')) {
                    url += '?dl=1';
                }
                const line = `${localFileName}\n${url}\n\n`;
                fs.appendFileSync('link.txt', line);
                console.log(`已寫入 link.txt: ${line}`);
            }
        } else {
            console.error('獲取分享連結失敗:', e);
        }
    }
}

async function uploadFile(filePath, dropboxPath, localFileName) {
    const fileSize = fs.statSync(filePath).size;
    const LARGE_FILE_THRESHOLD = 150 * 1024 * 1024;
    if (fileSize > LARGE_FILE_THRESHOLD) {
        await uploadLargeFile(filePath, dropboxPath);
        await saveSharedLink(dropboxPath, localFileName);
        return;
    }
    const startTime = new Date();
    console.log(`\n開始上傳文件`);
    console.log(`開始時間: ${formatTime(startTime)} (台灣時間)`);
    console.log(`文件路徑: ${filePath} -> ${dropboxPath}`);
    console.log(`文件大小: ${formatFileSize(fileSize)}`);
    try {
        const fileStream = fs.createReadStream(filePath);
        const response = await dbx.filesUpload({
            path: dropboxPath,
            mode: { '.tag': 'overwrite' }
        }, {
            contents: fileStream
        });
        const endTime = new Date();
        console.log(`\n上傳完成: ${path.basename(filePath)}`);
        console.log(`結束時間: ${formatTime(endTime)} (台灣時間)`);
        console.log(`總耗時: ${getTimeDiff(startTime, endTime)}`);
        console.log('----------------------------------------');
        await saveSharedLink(dropboxPath, localFileName);
        return response;
    } catch (error) {
        const endTime = new Date();
        console.error(`\n上傳失敗: ${filePath}`);
        console.error(`開始時間: ${formatTime(startTime)} (台灣時間)`);
        console.error(`結束時間: ${formatTime(endTime)} (台灣時間)`);
        console.error(`總耗時: ${getTimeDiff(startTime, endTime)}`);
        console.error(`錯誤信息:`, error);
        throw error;
    }
}

// 批次上傳
async function batchUpload() {
    for (const f of movFiles) {
        const dropboxPath = `/DJ Videos/${f.uploadName}`;
        try {
            await uploadFile(f.local, dropboxPath, f.uploadName);
        } catch (e) {
            console.error(`批次上傳失敗: ${f.local} -> ${dropboxPath}`);
        }
    }
    console.log('所有檔案批次上傳結束！');
}

// 執行批次上傳
batchUpload(); 