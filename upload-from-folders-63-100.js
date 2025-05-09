// 這是從 upload-from-folders.js 複製修改的版本，用於上傳 63-100 的資料夾
const fs = require('fs');
const path = require('path');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

// Dropbox 初始化
const dbx = new Dropbox({
    accessToken: 'sl.u.AFt1eYiXWlRy-t7S5wv8aTbe6KFwOxCAIlSRUDIz62asg4Q2um2v1omUy2w813lSNOkFlrsmKzro_yafOKgzxXiA7TjDTuRNiinI2T6Kr3HqmM_0EoK8BHbD0F1seQfwFvGto725tvYgxpp_pe7eJzggMJiEL3iuc7gAQy0F3Lth3aOlVAzPaphvKDWdmPqgWaqR1Ysn5FUKPrMqFmcjzffaaUNjdTUlJ9ijZ__3303o8p5To4D26CNK1TjZzdifjtNMCzWewCOnjulWzbtS75javgEfo6fnJmKzy1FDyjAqA2sme5wncNCMQlOcFfzEBy7BX02P-JjV-eE_9My7g-2uFXQUllZEvIyOMy_qCMRi7Awhkqpx5-GrBrV9SM62pMozWU-7Pt9R6L61RdwQsp-AMzLjO9rbAbgsjdD4wSUgf4GBnn8SFo0PT363Am5WXF0oMiGDED86MQ8cToV62xxj7bkTPn1rYsZSYz6Ny8qXj77BqL3_ymsFZff0IUhrWGBDFBVBxIsNa09hMJr0gR4i-lAGo8bv8ycmyS4tyPDIUWNWzrqMs6VfeNkNl0nFEH72A26-kGJpH2CrNOb7WxFY90qGfkOMnVpED795GDfMbpcTMVu1qrH7NgXUaV4OJK8mNzyFyJtTpnZuqO_rtd1eI5kteUdrdBSakqSpoNHm7-GAJy4NSf5yYbx1fWhwO-hKDNRpknq_D6yXH9uHTEJX9LZ6fWYP7AvppKmfGVoyzkDj_tphpAwZkhdJEj08BtPVYuBiDDnLQAIRBti_P6zAjTwYP_dfopwZw2Wm6ewJtiauey1UYHnHh3tfXS9DJIuAvmMCGFftd5c5B1Lgdvf1IVEGesEt2ruvH1xgZJUJzx3rTXFF3noySEb3ZlRUXGGD-NFKn0ZNZ6gQ4a9nvjUOki_ZqGCLU5kes25S2HNDSkzkviOJk9SAPCTjcXkZwgIom8IK_I_Tch84YrE293MmQyC4MiuLJByqLJ1FoDZ_GXvcwudi45CcJJPjJCGDyuXvy63Ob3co9Azepiwi8RgnBqOOJ7w15SXEE5tsB7_rPLg9-SauMMyY6tYocfNRoM7X3_pGfi0U-PxhWhDMIHxtq4G2jMSYWq_qiN2y4gL_jfzEGKB0PDVAuY-tftR0p-eHeUag7-1uS6uH-rc4XOVIPYm_o9if4mXNnnnPS4NyH-UCknA45mNfS1Md2D0hK5YCf8rycCZtWOucNdlnMxDbSm8p-KZidW10z2PjjAKU5Hisphm33yohcUXC1LdLRZNRQfivzzxbmH-ffF6XD80Z7Q109i5KDqGArmWdkt-wZCbNmQclnZrt-H4tnyNE0ItYRh_nvxWQRkFD-IPkCRcNiuAQpFSFtHKxcoIwqxEDob81vRhL0wAA8pAOEiJU1uMy39bY2OcRj0FxxDsZcP-C1-2EjQ-W2FDtqI4ZhFzT_0t4UC-pTVG8roPT0NRSN_boMSLpkDTGpBRL4QNysfGLe8NcErxAMbEcSEKSOprec-iwBDNJQAFzuOZyOYq9bHPsIxCXV7qavlEaDmUuMFjZ',
    fetch
});

// 目標資料夾
const baseDir = '/Users/flowasitgoes/DJ';
const movFiles = [];

// 只抓 63_ ~ 100_ 開頭的資料夾
const folders = fs.readdirSync(baseDir).filter(f => {
    const fullPath = path.join(baseDir, f);
    if (!fs.statSync(fullPath).isDirectory()) return false;
    const match = f.match(/^([0-9]{2,3})_/);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num >= 63 && num <= 100;
}).sort((a, b) => {
    // 按照數字大小排序
    const numA = parseInt(a.match(/^([0-9]{2,3})_/)[1], 10);
    const numB = parseInt(b.match(/^([0-9]{2,3})_/)[1], 10);
    return numA - numB;
});

// 遍歷每個資料夾，找出 .mov 檔案
folders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mov'));
    files.forEach(file => {
        // 產生新檔名 05_檔名.mov
        const folderNum = folder.match(/^([0-9]{2,3})_/)[1];
        // 確保資料夾編號是兩位數
        const paddedNum = folderNum.padStart(2, '0');
        const newName = `${paddedNum}_${file}`;
        movFiles.push({
            local: path.join(folderPath, file),
            uploadName: newName
        });
    });
});

// 列出所有需要上傳的檔案路徑
console.log('需要上傳的檔案：');
movFiles.forEach(f => {
    console.log(`${f.local} -> ${f.uploadName}`);
});

// 格式化時間函數
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
        // 移除所有現有的 dl 參數
        url = url.replace(/\?dl=[01]/, '');
        // 添加 dl=1 參數
        url = url + (url.includes('?') ? '&' : '?') + 'dl=1';
        const line = `${localFileName}\n${url}\n\n`;
        fs.appendFileSync('link.txt', line);
        console.log(`已寫入 link.txt: ${line}`);
    } catch (e) {
        if (e.error && e.error.error && e.error.error['.tag'] === 'shared_link_already_exists') {
            const res = await dbx.sharingListSharedLinks({ path: dropboxPath, direct_only: true });
            if (res.result && res.result.links && res.result.links.length > 0) {
                let url = res.result.links[0].url;
                // 移除所有現有的 dl 參數
                url = url.replace(/\?dl=[01]/, '');
                // 添加 dl=1 參數
                url = url + (url.includes('?') ? '&' : '?') + 'dl=1';
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