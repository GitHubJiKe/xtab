import path from "path";
import fs from "fs";

// 将manifest.json至dist文件夹内
function doCopy() {
    const manifestPath = path.resolve("manifest.json");
    const distPath = path.resolve("dist");
    const destManifestPath = path.join(distPath, "manifest.json");
    fs.copyFile(manifestPath, destManifestPath, (err) => {
        if (err) {
            console.error("复制 manifest.json 失败:", err);
        } else {
            console.log("manifest.json 复制成功");
        }
    });
}

doCopy();
