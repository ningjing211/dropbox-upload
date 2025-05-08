const express = require('express');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Dropbox 初始化
const dbx = new Dropbox({
    accessToken: 'sl.u.AFtCsdXAOCQ3bUeppe_XGQD3XYTHtWwtSC1BMRVUZzHoVpPoNP-nNggML53tNaFu3vzkRFNx8O5_-S92XfXdN7AGMWnqqaKTRkwfcZ8dr6fXi5V656wT4xNMPurfuJmI1NO27ffpsnLj4nreMEPM0ffK4ZDSy-DqnFjsJwyEFcxIAEGBIIb0qWhzN4tfnUVAAkMU_UPF-siN2mOMjTKd56CGs5MTHPgOnXfuXKS50nRwGnSamWpK_NVl3b5m49Kuu8ruy2m_XwJdBYIQm3IBKhV4IghxArpqWPH6t24HyyJ9--dJWmVIwnjoOFRJK5o3kazrMdrWW9bNuzVL05ZsdKI63tjPOZ3obxb5hHKkCzKvRYmPN6_CTk1uu5ga4NYTehIZQ28ytps15yQsjtb2IbGj4EqGbbbk0KwC-skl3-NdqDatd0K4YSSKNoXEVyfkLTA3hYwxUT9nBULezrvGeQMj-QfooXoryGujHTHAAIgd3DxcIkMZoK8DVnm40NBwaJO1OwWqOEBNb6o4rgGaNjeaP_BpLAwQevJFPMvlJ8dkO1sVp2QzrEUd5la5Xr8kkfUnyF8T04rTqkRdrCLwJLWgHjyO9NFp0SIvuh0ZibMttby71ggPfdsNzRvqKHyxVB5IbBgGXq8CeLwlYns2M7Nua56QPLB4ggxrREsfl1RXev3BWiX7H9hsGzYTuT7qdQrj-C-4DoPs_y-NfT3xjAcS6FLMEeZk5zsjGf4BCo3qRQqW4y2lCZuar9EemodvHsnZDT9Z8f83BeUREWt7h-Qs5T_PfqdJP4cym0s_D87VkBxyigOnPnHyNTIXtFcC6KEKWNv-TTytnn6lGB84eJg6_c_i9tgG_iquCm_BqCoz4qscIXm_-dsG7FPgi1xnpP7wYQntV-zer6tduw7DgKWn4gGu-5qluk-U4xOvuWmjDjpiZ2wGZ3QJWcai8QA-gIeJUmXuhE_hCVbw-2rhepUIwbPNwAPMmXmyffRLU6fRUAFXYCfl8Dnw576Bjn4rTGIZPU7TwY7oWkOcwVvrpLXlFaPj0EhS2xB_xQD4lUOnzNzkaMRC6lRe5uQ_yi6YFHZc8gbNuRiRagxJWCNXF6QFI3J7g1DvKoe2CkZg1jxL2OZSlvYMyUM6laNW9s3SADtAvvyMoCVLvdcg9UEnnQK-xozSSrX9RiGKDm_RY2_FhAazG8mpdMB3LtKqsHKs7x-lMAxd8qTBDG_NEDYXKiQdr5P22dxMLAvfnDAlA3aCxeLjDsGWyta2PehiefG4hkmuCEf_72YHOEK9cIJ2Mpn4Vl2ewP7mFmmfTDAGXHbv-zfiM0middO2m3LLgWoY1vRa46G5ZcavZPJ9DlAf_Zqxr_sreM_mQb5hh9c0eZ-T8E0OPNa_BHm4mUyinnbyhKqTnMe_cJX4aZ8CiurWuJVbduN4XRWoi9lNF6Zm6cgTyTylddleTuj91rPRtlTnZ-ZZJaT0dtf4fVSdeyiSpvSTyKP6QSuuxL2nGrQrfXkauN20R_KzWNy4XmbNO8YLeFMdEURZ_jlPqdSSM-2vrJ4w',
    fetch
});

// 格式化时间函数
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

// 计算时间差
function getTimeDiff(start, end) {
    const diff = end - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}小时${minutes}分${seconds}秒`;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件流
function getChunkStream(filePath, start, end) {
    return fs.createReadStream(filePath, { start, end });
}

// 分块上传
async function uploadChunks(filePath, dropboxPath, sessionId, start, end, fileSize, chunkLength) {
    if (start >= fileSize) {
        // 所有分块已上传，完成会话
        console.log('所有分块上传完成，正在结束会话...');
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

    // 调整最后一个分块的大小
    if (end >= fileSize) {
        end = fileSize - 1;
    }

    const chunkStream = getChunkStream(filePath, start, end);
    const currentChunkSize = end - start + 1;

    console.log(`上传分块：${formatFileSize(start)} - ${formatFileSize(end)} (${formatFileSize(currentChunkSize)})`);

    // 上传分块
    await dbx.filesUploadSessionAppendV2({
        cursor: {
            session_id: sessionId,
            offset: start
        },
        close: false,
        contents: chunkStream
    });

    const progress = ((start + currentChunkSize) / fileSize * 100).toFixed(2);
    console.log(`上传进度: ${progress}% (${formatFileSize(start + currentChunkSize)} / ${formatFileSize(fileSize)})`);

    // 递归上传下一个分块
    return await uploadChunks(filePath, dropboxPath, sessionId, end + 1, end + 1 + chunkLength, fileSize, chunkLength);
}

// 上传大文件
async function uploadLargeFile(filePath, dropboxPath) {
    const startTime = new Date();
    const fileSize = fs.statSync(filePath).size;
    const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB 分块

    console.log(`\n开始上传大文件`);
    console.log(`开始时间: ${formatTime(startTime)} (台湾时间)`);
    console.log(`文件路径: ${filePath} -> ${dropboxPath}`);
    console.log(`文件大小: ${formatFileSize(fileSize)}`);
    console.log(`分块大小: ${formatFileSize(CHUNK_SIZE)}`);

    try {
        // 开始上传会话
        console.log('开始上传会话...');
        const firstChunkStream = getChunkStream(filePath, 0, Math.min(CHUNK_SIZE - 1, fileSize - 1));
        const sessionStart = await dbx.filesUploadSessionStart({
            close: false,
            contents: firstChunkStream
        });

        console.log(`会话开始成功，会话ID: ${sessionStart.result.session_id}`);

        // 上传剩余分块
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
        console.log(`\n上传完成: ${path.basename(filePath)}`);
        console.log(`结束时间: ${formatTime(endTime)} (台湾时间)`);
        console.log(`总耗时: ${getTimeDiff(startTime, endTime)}`);
        console.log('----------------------------------------');

        return true;
    } catch (error) {
        const endTime = new Date();
        console.error(`\n上传失败: ${filePath}`);
        console.error(`开始时间: ${formatTime(startTime)} (台湾时间)`);
        console.error(`结束时间: ${formatTime(endTime)} (台湾时间)`);
        console.error(`总耗时: ${getTimeDiff(startTime, endTime)}`);
        console.error(`错误信息:`, error);
        throw error;
    }
}

// 获取 Dropbox 分享链接并写入 link.txt
async function saveSharedLink(dropboxPath, localFileName) {
    try {
        // 获取分享链接
        const res = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
        let url = res.result.url;
        // 替换为直接下载链接
        if (url.endsWith('?dl=0')) {
            url = url.replace('?dl=0', '?dl=1');
        } else if (!url.endsWith('?dl=1')) {
            url += '?dl=1';
        }
        const line = `${localFileName}\n${url}\n\n`;
        fs.appendFileSync('link.txt', line);
        console.log(`已写入 link.txt: ${line}`);
    } catch (e) {
        // 链接已存在时会报错，尝试获取已存在的链接
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
                console.log(`已写入 link.txt: ${line}`);
            }
        } else {
            console.error('获取分享链接失败:', e);
        }
    }
}

// 上传文件（根据大小选择上传方式）
async function uploadFile(filePath, dropboxPath) {
    const fileSize = fs.statSync(filePath).size;
    const LARGE_FILE_THRESHOLD = 150 * 1024 * 1024; // 150MB
    const localFileName = path.basename(filePath);

    if (fileSize > LARGE_FILE_THRESHOLD) {
        await uploadLargeFile(filePath, dropboxPath);
        await saveSharedLink(dropboxPath, localFileName);
        return;
    }

    const startTime = new Date();
    console.log(`\n开始上传文件`);
    console.log(`开始时间: ${formatTime(startTime)} (台湾时间)`);
    console.log(`文件路径: ${filePath} -> ${dropboxPath}`);
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
        console.log(`\n上传完成: ${path.basename(filePath)}`);
        console.log(`结束时间: ${formatTime(endTime)} (台湾时间)`);
        console.log(`总耗时: ${getTimeDiff(startTime, endTime)}`);
        console.log('----------------------------------------');

        await saveSharedLink(dropboxPath, localFileName);
        return response;
    } catch (error) {
        const endTime = new Date();
        console.error(`\n上传失败: ${filePath}`);
        console.error(`开始时间: ${formatTime(startTime)} (台湾时间)`);
        console.error(`结束时间: ${formatTime(endTime)} (台湾时间)`);
        console.error(`总耗时: ${getTimeDiff(startTime, endTime)}`);
        console.error(`错误信息:`, error);
        throw error;
    }
}

// 上传接口
app.post('/upload', async (req, res) => {
    try {
        const { filePath, dropboxPath } = req.body;
        
        if (!filePath || !dropboxPath) {
            return res.status(400).json({ error: '请提供文件路径和 Dropbox 路径' });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '文件不存在' });
        }

        const result = await uploadFile(filePath, dropboxPath);
        res.json({ success: true, result });
    } catch (error) {
        console.error('上传失败:', error);
        res.status(500).json({ error: '上传失败', details: error.message });
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('----------------------------------------');
    
    // 测试上传
    const testFile = '/Users/flowasitgoes/dropbox-upload/testFolder/01.mp4';
    const dropboxPath = '/DJ Videos/01.mp4';
    
    if (fs.existsSync(testFile)) {
        console.log('开始测试上传...');
        uploadFile(testFile, dropboxPath)
            .then(() => console.log('测试上传完成'))
            .catch(error => console.error('测试上传失败:', error));
    } else {
        console.log('测试文件不存在，跳过测试上传');
    }
});
