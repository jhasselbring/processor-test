const fs = require("fs");
const path = require('path');
const uuid = require('uuid').v4;
const { execSync } = require('child_process');
const root = `V:/Sandbox/Desktop/Learning/Node/System Info/node_modules/vfs/processor-test/test-fs`;
const rootDir = root + '/ob';
const limbo = root + '/limbo';
const finalDest = root + '/s'
let files = [];
let mediaMap = {
    "jpg": {
        type: 1,
        rev: "c"
    },
    "JPG": {
        type: 1,
        rev: "c",
        cannon: "jpg"
    },
    "png": {
        type: 1,
        rev: "cpp"
    },
    "PNG": {
        type: 1,
        rev: "cpp",
        canon: "png"
    },
    "gif": {
        type: 1,
        rev: "cs"
    },
    "mp4": {
        type: 0,
        rev: "js"
    },
    "MP4": {
        type: 0,
        rev: "js",
        canon: "mp4"
    },
    "avi": {
        type: 0,
        rev: "css"
    },
    "wmv": {
        type: 0,
        rev: "scss"
    },
    "mpg": {
        type: 0,
        rev: "vue"
    },
    "mkv": {
        type: 0,
        rev: "pug"
    },
    "flv": {
        type: 0,
        rev: "conf"
    },
    "mov": {
        type: 0,
        rev: "dmg"
    },
    "MOV": {
        type: 0,
        rev: "dmg"
    },
    "3gp": {
        type: 0,
        rev: "ppl"
    },
    "m4v": {
        type: 0,
        rev: "xml"
    }
}
const getFileList = (dir) => {
    return fs.readdirSync(dir);
}
const isAccepted = ext => {
    return typeof mediaMap[ext] != 'undefined';
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
const writeMeta = (completeDestPath, name, group) => {
    let meta = {
        name: name,
        group: group
    };

    let data = JSON.stringify(meta, null, 2);

    fs.writeFile(completeDestPath + '.json', data, (err) => {
        if (err) throw err;
    });
}
const getMediaType = ext => {
    return (mediaMap[ext] && Number.isInteger(mediaMap[ext].type)) ? mediaMap[ext].type : -1;
}
const processFile = (file, group) => {
    files[group].push(file);
    let ext = getExt(file);
    let currentFileName = path.basename(file).replace('.' + ext, '');
    let hashName = generateUniqueFilename(ext);


    if (isAccepted(ext)) {
        if (getMediaType(ext)) {
            move(file, limbo + '/still/' + hashName + '.' + ext).then(() => {
                writeMeta(completeDestPath, currentFileName, group);
            });
        } else {
            let completeDestPath = limbo + '/motion/' + hashName;
            let command = `ffmpeg -i "${file}" "${completeDestPath}.mp4" -vf framestep=20,setpts=N/60/TB,scale=-1:320 "${completeDestPath}.gif"`;
            console.log('command', command);
            let response = execSync(command, { maxBuffer: 1024 * 3000, encoding: "UTF-8" });

            if (response.error) {
                console.error('toMp4Sync failed for:', file);
            } else {
                writeMeta(completeDestPath, currentFileName, group);
                fs.unlinkSync(file);
            }
        }
    } else {
        move(file, limbo + '/misc/' + currentFileName + '.' + ext);
    }

}
const generateUniqueFilename = ext => {
    // Get list filenames in catalog
    let prodList = getFileList(finalDest);
    let limboStillList = getFileList(limbo + '/still');
    let limboMotionList = getFileList(limbo + '/motion');
    let existingFileList = prodList.concat(limboMotionList.concat(limboStillList));

    let newFileBaseName = uuid();

    let newFileName = newFileBaseName + ext;

    // Generate a new filename that's not already in catalog
    while (existingFileList.includes(newFileName)) {
        newFileBaseName = uuid();
    }
    return newFileBaseName;

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