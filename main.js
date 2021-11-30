const fs = require("fs");
const path = require('path');

const rootDir = './root';
const purgatory = './purgatory';

let files = [];

const getFileList = (dir) => {
    return fs.readdirSync(dir);
}

const getExt = file => {
    return path.extname(file).replace('.', '').toLowerCase();
}
const move = async (from, to) => {
    return new Promise((resolve, reject) => {
        fs.rename(from, to, (error) => {
            if (error) {
                reject(error)
            } else {
                resolve(true);
            }
        });
    });
}
const writeMeta = (name, group) => {
    let meta = {
        name: name,
        group: group
    };

    let data = JSON.stringify(meta, null, 2);

    fs.writeFile('student-3.json', data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}
const processFile = (file, group) => {
    files[group].push(file);
    let currentFileName = (1);
    let ext = (1);
    let hashName = (1);

    if (1/* Accepted File */) {
        if (1 /* If still */) {
            move(file, purgatory + '/still/' + hashName + '.' + ext).then(() => {
                writeMeta(currentFileName, group);
            });
        } else {
            let completeDestPath = purgatory + '/motion/' + hashName;
            let response = execSync(`ffmpeg -i '${file}' '${completeDestPath}'.mp4 -vf framestep=20,setpts=N/60/TB,scale=-1:320 '${completeDestPath}.gif'`,
                { maxBuffer: 1024 * 3000, encoding: "UTF-8" });

            if (response.error) {
                console.error('toMp4Sync failed for:', file);
            } else {
                fs.unlinkSync(file);
            }
        }
    } else {
        // Move to purgatory 
    }

}
const processDir = (dir, group) => {
    let items = getFileList(dir);
    items.forEach(item => {
        let fullItemPath = dir + '/' + item;
        if (fs.lstatSync(fullItemPath).isDirectory()) {
            processDir(fullItemPath, group);
        } else {
            processFile(fullItemPath, group);
        }
    })
}
let groupCandidates = getFileList(rootDir);


groupCandidates.forEach(groupCandidate => {
    let fullItemPath = rootDir + '/' + groupCandidate;
    if (fs.lstatSync(fullItemPath).isDirectory()) {
        files[groupCandidate] = [];
        processDir(rootDir + '/' + groupCandidate, groupCandidate);
    }
})


console.log('files', files);