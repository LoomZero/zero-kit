const Path = require('path');
const FS = require('fs');

/**
 * @callback copyCallback
 * @param {string} from
 * @param {string} to
 * @param {boolean} isDir
 */

module.exports = class FileUtil {

  /**
   * Find a file in parents directory.
   * 
   * @param {string} path 
   * @param {string} file 
   * @returns {(string|null)}
   */
  static findFileRoot(path, file) {
    let root = path;
    while (root) {
      if (FS.existsSync(Path.join(root, file))) {
        return Path.join(root, file);
      }
      const parent = Path.join(root, '..');
      if (parent === root) break;
      root = parent;
    }
    return null;
  }

  /**
   * @param {string} path
   * @param {import('../../types').C_FileWalker} callback 
   * @param {boolean} revert
   * @param {Object} info
   * @param {string} relative
   */
  static fileWalk(path, callback, revert = false, info = {}, relative = '') {
    const current = Path.join(path, relative);

    if (FS.statSync(current).isFile()) {
      callback(current, path, relative, info);
      return;
    } 
    for (const file of FS.readdirSync(current)) {
      const local = Path.join(current, file);
      const rel = relative ? Path.join(relative, file) : file;

      if (FS.statSync(local).isFile()) {
        callback(local, path, rel, info);
      } else {
        if (revert) FileUtil.fileWalk(path, callback, revert, info, rel);
        callback(local, path, rel, info);
        if (!revert) FileUtil.fileWalk(path, callback, revert, info, rel);
      }
    }
  }

  /**
   * @param {string} path 
   * @param {import('../../types').C_FileWalker} callback
   */
  static removePath(path, callback) {
    FileUtil.fileWalk(path, (file, path, relative, info) => {
      callback(file, path, relative, info);
      if (FS.statSync(file).isFile()) {
        FS.unlinkSync(file);
      } else {
        FS.rmdirSync(file);
      }
    }, true);
  }

  /**
   * Copy a path and all child elements.
   * 
   * @param {string} from 
   * @param {string} to 
   * @param {copyCallback} callback
   */
  static copyPath(from, to, callback = null) {
    if (FS.statSync(from).isFile()) {
      if (callback) callback(from, Path.join(to, Path.basename(from)), false);
      FS.writeFileSync(Path.join(to, Path.basename(from)), FS.readFileSync(from));
      return;
    }
    const files = FS.readdirSync(from);
    for (const file of files) {
      const path = Path.join(from, file);
      const toPath = Path.join(to, file);

      if (FS.statSync(path).isDirectory()) {
        if (callback) callback(path, toPath, true);
        FS.mkdirSync(toPath);
        FileUtil.copyPath(path, toPath);
      } else {
        if (callback) callback(path, toPath, false);
        FS.writeFileSync(toPath, FS.readFileSync(path));
      }
    }
  }

  /**
   * Create directories.
   * 
   * @param {string} root
   * @param {string} path 
   * @param {boolean} isFile
   */
  static prepareDir(root, path, isFile = true) {
    root = Path.normalize(root);
    path = Path.normalize(path);
    
    if (isFile) path = Path.dirname(path);
    if (path.startsWith(root)) {
      path = path.substring(root.length);
    }
    
    let file = root;
    for (const part of path.split(Path.sep)) {
      file = Path.join(file, part);
      if (!FS.existsSync(file)) {
        FS.mkdirSync(file);
      }
    }
  }

}