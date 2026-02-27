import { useEffect, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'terminal_simulator_linux_fs_v1'
const STORAGE_PACKAGES_KEY = 'terminal_simulator_packages_v1'
const STORAGE_BOOT_KEY = 'terminal_simulator_boot_ts_v1'
const USERNAME = 'dev'
const HOSTNAME = 'ubuntu'
const HOME_PATH = `/home/${USERNAME}`

const COMMAND_PATHS = {
  ls: '/bin/ls',
  cd: '/bin/cd',
  pwd: '/bin/pwd',
  mkdir: '/bin/mkdir',
  rmdir: '/bin/rmdir',
  rm: '/bin/rm',
  cp: '/bin/cp',
  mv: '/bin/mv',
  touch: '/bin/touch',
  stat: '/usr/bin/stat',
  cat: '/bin/cat',
  less: '/usr/bin/less',
  more: '/bin/more',
  head: '/usr/bin/head',
  tail: '/usr/bin/tail',
  find: '/usr/bin/find',
  locate: '/usr/bin/locate',
  grep: '/bin/grep',
  which: '/usr/bin/which',
  whereis: '/usr/bin/whereis',
  chmod: '/bin/chmod',
  chown: '/bin/chown',
  chgrp: '/bin/chgrp',
  apt: '/usr/bin/apt',
  uname: '/bin/uname',
  hostname: '/bin/hostname',
  uptime: '/usr/bin/uptime',
  date: '/bin/date',
  cal: '/usr/bin/cal',
  ps: '/bin/ps',
  top: '/usr/bin/top',
  htop: '/usr/bin/htop',
  kill: '/bin/kill',
  pkill: '/usr/bin/pkill',
  ping: '/bin/ping',
  ifconfig: '/sbin/ifconfig',
  ip: '/sbin/ip',
  netstat: '/bin/netstat',
  curl: '/usr/bin/curl',
  wget: '/usr/bin/wget',
  tar: '/bin/tar',
  gzip: '/bin/gzip',
  gunzip: '/bin/gunzip',
  zip: '/usr/bin/zip',
  unzip: '/usr/bin/unzip',
  man: '/usr/bin/man',
  info: '/usr/bin/info',
  nano: '/bin/nano',
  clear: '/usr/bin/clear',
  help: '/usr/bin/help',
}

const AVAILABLE_PACKAGES = [
  { name: 'curl', version: '8.5.0', description: 'transfer data from or to a server' },
  { name: 'wget', version: '1.21.4', description: 'non-interactive network downloader' },
  { name: 'htop', version: '3.2.2', description: 'interactive process viewer' },
  { name: 'net-tools', version: '2.10', description: 'ifconfig, netstat and tools' },
  { name: 'zip', version: '3.0', description: 'compress and archive utility' },
  { name: 'unzip', version: '6.0', description: 'extract zip archives' },
  { name: 'less', version: '590', description: 'file pager' },
  { name: 'nano', version: '8.0', description: 'text editor' },
]

const DEFAULT_INSTALLED_PACKAGES = [
  'base-files',
  'bash',
  'coreutils',
  'grep',
  'sed',
  'nano',
  'less',
  'tar',
  'gzip',
]

const NANO_VIEWPORT_LINES = 20
const NANO_SHORTCUT_ROWS = [
  ['^G Help', '^O Write Out', '^W Where Is', '^K Cut Text', '^J Justify', '^C Cur Pos'],
  ['^X Exit', '^R Read File', '^\\ Replace', '^U Paste Text', '^T To Spell', '^_ Go To Line'],
]

const dir = (children = {}) => ({ type: 'dir', children })
const file = (content = '') => ({ type: 'file', content })

function createDefaultFileSystem() {
  return dir({
    bin: dir({
      bash: file('# simulated executable\n'),
      cat: file('# simulated executable\n'),
      ls: file('# simulated executable\n'),
      mkdir: file('# simulated executable\n'),
      nano: file('# simulated executable\n'),
    }),
    boot: dir({
      grub: dir({
        'grub.cfg': file('set timeout=0\nset default=0\n'),
      }),
    }),
    dev: dir({
      null: file(''),
      random: file(''),
      tty0: file(''),
      urandom: file(''),
    }),
    etc: dir({
      fstab: file(
        '# <file system> <mount point> <type> <options> <dump> <pass>\nUUID=xxxx-xxxx / ext4 defaults 0 1\n'
      ),
      group: file('root:x:0:\nadm:x:4:syslog,dev\ndev:x:1000:\n'),
      hostname: file(`${HOSTNAME}\n`),
      hosts: file(
        '127.0.0.1\tlocalhost\n127.0.1.1\tubuntu\n\n::1\tlocalhost ip6-localhost ip6-loopback\nff02::1\tip6-allnodes\nff02::2\tip6-allrouters\n'
      ),
      issue: file('Ubuntu 24.04 LTS \\n \\l\n'),
      motd: file(
        'Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Support:        https://ubuntu.com/pro\n'
      ),
      'os-release': file(
        'PRETTY_NAME="Ubuntu 24.04 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\n'
      ),
      passwd: file(
        `root:x:0:0:root:/root:/bin/bash\n${USERNAME}:x:1000:1000:Developer,,,:${HOME_PATH}:/bin/bash\n`
      ),
      'resolv.conf': file('nameserver 1.1.1.1\nnameserver 8.8.8.8\n'),
      shadow: file('root:*:19000:0:99999:7:::\ndev:*:19000:0:99999:7:::\n'),
      shells: file('/bin/sh\n/bin/bash\n/usr/bin/bash\n'),
      skel: dir({
        '.bash_logout': file('# ~/.bash_logout\n'),
        '.bashrc': file('# ~/.bashrc\nexport HISTCONTROL=ignoredups\nalias ll="ls -a"\n'),
        '.profile': file(
          '# ~/.profile\nif [ -n "$BASH_VERSION" ]; then\n  . "$HOME/.bashrc"\nfi\n'
        ),
      }),
    }),
    home: dir({
      [USERNAME]: dir({
        Desktop: dir({}),
        Documents: dir({
          'notes.txt': file('Linux terminal simulator\n\nUse ls, cd, cat, nano, mkdir.\n'),
        }),
        Downloads: dir({}),
        Music: dir({}),
        Pictures: dir({}),
        Public: dir({}),
        Templates: dir({}),
        Videos: dir({}),
        '.bash_history': file('ls\ncd Documents\ncat notes.txt\n'),
        '.bash_logout': file('# ~/.bash_logout\n'),
        '.bashrc': file('# ~/.bashrc\nPS1="\\u@\\h:\\w$ "\nalias ll="ls -a"\n'),
        '.profile': file('# ~/.profile\nif [ -n "$BASH_VERSION" ]; then\n  . "$HOME/.bashrc"\nfi\n'),
        '.selected_editor': file('/bin/nano\n'),
      }),
    }),
    lib: dir({}),
    lib64: dir({}),
    media: dir({}),
    mnt: dir({}),
    opt: dir({}),
    proc: dir({
      cpuinfo: file('processor\t: 0\nmodel name\t: Intel(R) Core(TM) i7\n'),
      meminfo: file('MemTotal:       16384256 kB\nMemFree:         8097152 kB\n'),
      uptime: file('5234.12 10291.77\n'),
    }),
    root: dir({
      '.bashrc': file('# root shell config\n'),
    }),
    run: dir({}),
    sbin: dir({}),
    srv: dir({}),
    sys: dir({}),
    tmp: dir({}),
    usr: dir({
      bin: dir({
        bash: file('# simulated executable\n'),
        nano: file('# simulated executable\n'),
        vim: file('# simulated executable\n'),
      }),
      local: dir({
        bin: dir({}),
      }),
      share: dir({
        doc: dir({
          README: file('System documentation placeholder.\n'),
        }),
      }),
    }),
    var: dir({
      log: dir({
        'auth.log': file('Feb 27 16:00:00 ubuntu sshd[1034]: Accepted password for dev\n'),
        'dpkg.log': file('2026-02-27 16:00:00 install simulator-base:all <none> 1.0\n'),
        syslog: file('Feb 27 16:00:00 ubuntu systemd[1]: Started Session 1 of user dev.\n'),
      }),
      tmp: dir({}),
      www: dir({
        html: dir({
          'index.html': file('<!doctype html>\n<html><body><h1>It works!</h1></body></html>\n'),
        }),
      }),
    }),
  })
}

function splitPath(path) {
  return path.split('/').filter(Boolean)
}

function normalizePath(path, currentPath) {
  if (!path || path === '.') return currentPath

  let basePath = ''
  if (path.startsWith('~')) {
    basePath = `${HOME_PATH}${path.slice(1)}`
  } else if (path.startsWith('/')) {
    basePath = path
  } else {
    basePath = `${currentPath}/${path}`
  }

  const normalized = []
  for (const segment of splitPath(basePath)) {
    if (segment === '.' || segment.length === 0) continue
    if (segment === '..') {
      normalized.pop()
      continue
    }
    normalized.push(segment)
  }

  return `/${normalized.join('/')}`
}

function formatPromptPath(path) {
  if (path === HOME_PATH) return '~'
  if (path.startsWith(`${HOME_PATH}/`)) {
    return `~${path.slice(HOME_PATH.length)}`
  }
  return path
}

function getBaseName(path) {
  if (path === '/') return '/'
  const segments = splitPath(path)
  return segments[segments.length - 1] || '/'
}

function cloneFileSystem(fileSystem) {
  if (typeof structuredClone === 'function') {
    return structuredClone(fileSystem)
  }
  return JSON.parse(JSON.stringify(fileSystem))
}

function getNodeAtPath(fileSystem, path) {
  let currentNode = fileSystem
  for (const segment of splitPath(path)) {
    if (currentNode.type !== 'dir') return null
    currentNode = currentNode.children[segment]
    if (!currentNode) return null
  }
  return currentNode
}

function createDirectoryAtPath(fileSystem, path) {
  const segments = splitPath(path)
  if (segments.length === 0) {
    return { error: "mkdir: cannot create directory '/': File exists" }
  }

  const cloned = cloneFileSystem(fileSystem)
  let currentNode = cloned
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    const nextNode = currentNode.children[segment]
    if (!nextNode) {
      return {
        error: `mkdir: cannot create directory '${path}': No such file or directory`,
      }
    }
    if (nextNode.type !== 'dir') {
      return {
        error: `mkdir: cannot create directory '${path}': Not a directory`,
      }
    }
    currentNode = nextNode
  }

  const name = segments[segments.length - 1]
  if (currentNode.children[name]) {
    return { error: `mkdir: cannot create directory '${path}': File exists` }
  }

  currentNode.children[name] = ensureNodeMetadata(dir({}), path)
  currentNode.children[name].mtime = new Date().toISOString()
  return { root: cloned }
}

function writeFileAtPath(fileSystem, path, content) {
  const segments = splitPath(path)
  if (segments.length === 0) {
    return { error: `nano: cannot write to '${path}'` }
  }

  const cloned = cloneFileSystem(fileSystem)
  let currentNode = cloned
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    const nextNode = currentNode.children[segment]
    if (!nextNode) {
      return { error: `nano: ${path}: No such file or directory` }
    }
    if (nextNode.type !== 'dir') {
      return { error: `nano: ${path}: Not a directory` }
    }
    currentNode = nextNode
  }

  const fileName = segments[segments.length - 1]
  const existingNode = currentNode.children[fileName]
  if (existingNode && existingNode.type === 'dir') {
    return { error: `nano: ${path}: Is a directory` }
  }

  currentNode.children[fileName] = file(content)
  const writtenPath = path === '/' ? `/${fileName}` : path
  currentNode.children[fileName] = ensureNodeMetadata(
    { ...currentNode.children[fileName], content },
    writtenPath
  )
  currentNode.children[fileName].mtime = new Date().toISOString()
  return { root: cloned, created: !existingNode }
}

function resolveParentNode(root, path) {
  const segments = splitPath(path)
  if (segments.length === 0) {
    return { error: 'Operation not permitted on root path' }
  }

  let parent = root
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    const child = parent.children[segment]
    if (!child) {
      return { error: 'No such file or directory' }
    }
    if (child.type !== 'dir') {
      return { error: 'Not a directory' }
    }
    parent = child
  }

  return { parent, name: segments[segments.length - 1] }
}

function deepCloneNode(node, path) {
  if (node.type === 'file') {
    return ensureNodeMetadata({ ...node, content: node.content ?? '' }, path)
  }

  const children = {}
  for (const [name, child] of Object.entries(node.children || {})) {
    const childPath = path === '/' ? `/${name}` : `${path}/${name}`
    children[name] = deepCloneNode(child, childPath)
  }
  return ensureNodeMetadata({ ...node, children }, path)
}

function touchPath(fileSystem, path) {
  const cloned = cloneFileSystem(fileSystem)
  const parentInfo = resolveParentNode(cloned, path)
  if (parentInfo.error) {
    return { error: `touch: cannot touch '${path}': ${parentInfo.error}` }
  }

  const { parent, name } = parentInfo
  const existing = parent.children[name]
  const now = new Date().toISOString()

  if (existing) {
    if (existing.type !== 'file') {
      return { error: `touch: cannot touch '${path}': Is a directory` }
    }
    parent.children[name] = { ...existing, mtime: now }
    return { root: cloned, created: false }
  }

  const fullPath = path
  parent.children[name] = ensureNodeMetadata(file(''), fullPath)
  parent.children[name].mtime = now
  return { root: cloned, created: true }
}

function removePath(fileSystem, path, recursive = false) {
  const cloned = cloneFileSystem(fileSystem)
  const parentInfo = resolveParentNode(cloned, path)
  if (parentInfo.error) {
    return { error: `rm: cannot remove '${path}': ${parentInfo.error}` }
  }

  const { parent, name } = parentInfo
  const target = parent.children[name]
  if (!target) {
    return { error: `rm: cannot remove '${path}': No such file or directory` }
  }

  if (target.type === 'dir' && !recursive) {
    return { error: `rm: cannot remove '${path}': Is a directory` }
  }

  delete parent.children[name]
  parent.mtime = new Date().toISOString()
  return { root: cloned }
}

function removeDirectoryPath(fileSystem, path) {
  const cloned = cloneFileSystem(fileSystem)
  const parentInfo = resolveParentNode(cloned, path)
  if (parentInfo.error) {
    return { error: `rmdir: failed to remove '${path}': ${parentInfo.error}` }
  }

  const { parent, name } = parentInfo
  const target = parent.children[name]
  if (!target) {
    return { error: `rmdir: failed to remove '${path}': No such file or directory` }
  }
  if (target.type !== 'dir') {
    return { error: `rmdir: failed to remove '${path}': Not a directory` }
  }
  if (Object.keys(target.children).length > 0) {
    return { error: `rmdir: failed to remove '${path}': Directory not empty` }
  }

  delete parent.children[name]
  parent.mtime = new Date().toISOString()
  return { root: cloned }
}

function resolveCopyTargetPath(fileSystem, sourcePath, destinationPath) {
  const destinationNode = getNodeAtPath(fileSystem, destinationPath)
  if (destinationNode && destinationNode.type === 'dir') {
    const baseName = getBaseName(sourcePath)
    return destinationPath === '/' ? `/${baseName}` : `${destinationPath}/${baseName}`
  }
  return destinationPath
}

function copyPath(fileSystem, sourcePath, destinationPath, recursive = false) {
  const sourceNode = getNodeAtPath(fileSystem, sourcePath)
  if (!sourceNode) {
    return { error: `cp: cannot stat '${sourcePath}': No such file or directory` }
  }
  if (sourceNode.type === 'dir' && !recursive) {
    return { error: `cp: -r not specified; omitting directory '${sourcePath}'` }
  }

  const cloned = cloneFileSystem(fileSystem)
  const targetPath = resolveCopyTargetPath(cloned, sourcePath, destinationPath)
  if (sourcePath === targetPath) {
    return {
      error: `cp: '${sourcePath}' and '${destinationPath}' are the same file`,
    }
  }

  const parentInfo = resolveParentNode(cloned, targetPath)
  if (parentInfo.error) {
    return {
      error: `cp: cannot create regular file '${destinationPath}': ${parentInfo.error}`,
    }
  }

  const { parent, name } = parentInfo
  const existing = parent.children[name]
  if (existing && existing.type === 'dir' && sourceNode.type === 'file') {
    return { error: `cp: cannot overwrite directory '${targetPath}' with non-directory` }
  }
  if (existing && existing.type === 'file' && sourceNode.type === 'dir') {
    return { error: `cp: cannot overwrite non-directory '${targetPath}' with directory` }
  }

  parent.children[name] = deepCloneNode(sourceNode, targetPath)
  parent.children[name].mtime = new Date().toISOString()
  parent.mtime = new Date().toISOString()
  return { root: cloned }
}

function movePath(fileSystem, sourcePath, destinationPath) {
  const sourceNode = getNodeAtPath(fileSystem, sourcePath)
  if (!sourceNode) {
    return { error: `mv: cannot stat '${sourcePath}': No such file or directory` }
  }

  const cloned = cloneFileSystem(fileSystem)
  const realDestinationPath = resolveCopyTargetPath(cloned, sourcePath, destinationPath)
  if (sourcePath === realDestinationPath) {
    return { root: cloned }
  }

  if (sourceNode.type === 'dir' && realDestinationPath.startsWith(`${sourcePath}/`)) {
    return {
      error: `mv: cannot move '${sourcePath}' to a subdirectory of itself, '${realDestinationPath}'`,
    }
  }

  const sourceParentInfo = resolveParentNode(cloned, sourcePath)
  if (sourceParentInfo.error) {
    return { error: `mv: cannot move '${sourcePath}': ${sourceParentInfo.error}` }
  }
  const destinationParentInfo = resolveParentNode(cloned, realDestinationPath)
  if (destinationParentInfo.error) {
    return {
      error: `mv: cannot move '${sourcePath}' to '${destinationPath}': ${destinationParentInfo.error}`,
    }
  }

  const movingNode = sourceParentInfo.parent.children[sourceParentInfo.name]
  if (!movingNode) {
    return { error: `mv: cannot stat '${sourcePath}': No such file or directory` }
  }

  destinationParentInfo.parent.children[destinationParentInfo.name] = movingNode
  destinationParentInfo.parent.children[destinationParentInfo.name].mtime = new Date().toISOString()
  delete sourceParentInfo.parent.children[sourceParentInfo.name]
  sourceParentInfo.parent.mtime = new Date().toISOString()
  destinationParentInfo.parent.mtime = new Date().toISOString()
  return { root: cloned }
}

function mutateNodeAtPath(fileSystem, path, mutator, commandName) {
  const cloned = cloneFileSystem(fileSystem)
  const parentInfo = resolveParentNode(cloned, path)
  if (parentInfo.error) {
    return { error: `${commandName}: cannot access '${path}': ${parentInfo.error}` }
  }

  const node = parentInfo.parent.children[parentInfo.name]
  if (!node) {
    return { error: `${commandName}: cannot access '${path}': No such file or directory` }
  }

  const nextNode = mutator({ ...node }, path)
  parentInfo.parent.children[parentInfo.name] = nextNode
  parentInfo.parent.mtime = new Date().toISOString()
  return { root: cloned }
}

function walkFileSystem(node, currentPath, visitor) {
  visitor(node, currentPath)
  if (node.type !== 'dir') return
  const names = Object.keys(node.children).sort((a, b) => a.localeCompare(b))
  for (const name of names) {
    const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
    walkFileSystem(node.children[name], childPath, visitor)
  }
}

function ensureDirectoryPath(fileSystem, path) {
  if (path === '/') return { root: fileSystem }

  const cloned = cloneFileSystem(fileSystem)
  let currentNode = cloned
  let currentPath = ''
  for (const segment of splitPath(path)) {
    currentPath += `/${segment}`
    if (!currentNode.children[segment]) {
      currentNode.children[segment] = ensureNodeMetadata(dir({}), currentPath)
    } else if (currentNode.children[segment].type !== 'dir') {
      return { error: `Path component '${segment}' is not a directory` }
    }
    currentNode = currentNode.children[segment]
  }
  return { root: cloned }
}

function formatPermissionOctal(mode) {
  const chunks = [mode.slice(1, 4), mode.slice(4, 7), mode.slice(7, 10)]
  return chunks
    .map((chunk) => {
      let value = 0
      if (chunk[0] === 'r') value += 4
      if (chunk[1] === 'w') value += 2
      if (chunk[2] === 'x') value += 1
      return value
    })
    .join('')
}

function getParentPath(path) {
  if (path === '/') return '/'
  const parts = splitPath(path)
  if (parts.length <= 1) return '/'
  return `/${parts.slice(0, -1).join('/')}`
}

function getPermissionChunk(node, user) {
  const mode = node.mode || defaultMode('/', node.type)
  if (user === 'root') return 'rwx'
  if (node.owner === user) return mode.slice(1, 4)
  if (node.group === user) return mode.slice(4, 7)
  return mode.slice(7, 10)
}

function hasPermission(node, user, permission) {
  const chunk = getPermissionChunk(node, user)
  if (permission === 'r') return chunk[0] === 'r'
  if (permission === 'w') return chunk[1] === 'w'
  if (permission === 'x') return chunk[2] === 'x'
  return false
}

function checkParentDirectoryPermission(root, targetPath, user, command) {
  const parentPath = getParentPath(targetPath)
  const parentNode = getNodeAtPath(root, parentPath)
  if (!parentNode || parentNode.type !== 'dir') {
    return `${command}: cannot access '${targetPath}': No such file or directory`
  }
  if (!hasPermission(parentNode, user, 'w') || !hasPermission(parentNode, user, 'x')) {
    return `${command}: cannot access '${targetPath}': Permission denied`
  }
  return null
}

function usageForCommand(command) {
  const usageMap = {
    ls: 'ls [-a] [-l] [path]',
    cd: 'cd [directory]',
    pwd: 'pwd',
    mkdir: 'mkdir directory...',
    rmdir: 'rmdir directory...',
    rm: 'rm [-r] path...',
    cp: 'cp [-r] source destination',
    mv: 'mv source destination',
    touch: 'touch file...',
    stat: 'stat file...',
    cat: 'cat file...',
    less: 'less file',
    more: 'more file',
    head: 'head [-n N] file...',
    tail: 'tail [-n N] [-f] file...',
    find: 'find [path] [-name pattern]',
    locate: 'locate pattern',
    grep: 'grep [-r] pattern file...',
    which: 'which command...',
    whereis: 'whereis command...',
    chmod: 'chmod MODE file...',
    chown: 'chown OWNER[:GROUP] file...',
    chgrp: 'chgrp GROUP file...',
    apt: 'apt <update|upgrade|install|remove|search> [args]',
    uname: 'uname [-a]',
    hostname: 'hostname',
    uptime: 'uptime',
    date: 'date',
    cal: 'cal',
    ps: 'ps',
    top: 'top',
    htop: 'htop',
    kill: 'kill [-9] pid...',
    pkill: 'pkill pattern',
    ping: 'ping host [-c count]',
    ifconfig: 'ifconfig',
    ip: 'ip a',
    netstat: 'netstat',
    curl: 'curl URL',
    wget: 'wget URL [-O file]',
    tar: 'tar -cvf archive.tar files... | tar -xvf archive.tar',
    gzip: 'gzip file',
    gunzip: 'gunzip file.gz',
    zip: 'zip archive.zip file...',
    unzip: 'unzip archive.zip',
    man: 'man command',
    info: 'info topic',
    nano: 'nano file',
    clear: 'clear',
    help: 'help',
  }
  return usageMap[command] || null
}

function tokenize(input) {
  const matches = input.match(/"[^"]*"|'[^']*'|\S+/g) || []
  return matches.map((token) => {
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return token.slice(1, -1)
    }
    return token
  })
}

function loadFileSystemFromStorage() {
  if (typeof window === 'undefined') {
    return sanitizeFileSystem(createDefaultFileSystem())
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.type === 'dir') {
        return sanitizeFileSystem(parsed)
      }
    }
  } catch {
    // Ignore parse errors and rebuild.
  }

  const initialFileSystem = sanitizeFileSystem(createDefaultFileSystem())
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFileSystem))
  return initialFileSystem
}

async function writeClipboardText(text) {
  if (!text) return true

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(textArea)
      return copied
    } catch {
      return false
    }
  }
}

async function readClipboardText() {
  try {
    return await navigator.clipboard.readText()
  } catch {
    return null
  }
}

function loadInstalledPackagesFromStorage() {
  if (typeof window === 'undefined') return DEFAULT_INSTALLED_PACKAGES
  try {
    const raw = window.localStorage.getItem(STORAGE_PACKAGES_KEY)
    if (!raw) return DEFAULT_INSTALLED_PACKAGES
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Ignore parse errors and fallback.
  }
  return DEFAULT_INSTALLED_PACKAGES
}

function loadBootTimestamp() {
  if (typeof window === 'undefined') return Date.now()
  try {
    const raw = window.localStorage.getItem(STORAGE_BOOT_KEY)
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  } catch {
    // Ignore parse errors and recreate boot timestamp.
  }
  const now = Date.now()
  window.localStorage.setItem(STORAGE_BOOT_KEY, String(now))
  return now
}

function createDefaultProcesses() {
  return [
    { pid: 1, user: 'root', cpu: '0.0', mem: '0.1', tty: '?', time: '00:00:02', cmd: 'systemd' },
    { pid: 631, user: 'root', cpu: '0.0', mem: '0.2', tty: '?', time: '00:00:00', cmd: 'sshd' },
    { pid: 921, user: USERNAME, cpu: '0.0', mem: '0.1', tty: 'pts/0', time: '00:00:00', cmd: 'bash' },
    { pid: 1044, user: USERNAME, cpu: '0.1', mem: '0.3', tty: 'pts/0', time: '00:00:01', cmd: 'terminal-simulator' },
  ]
}

function isExecutablePath(path) {
  return path.startsWith('/bin/') || path.startsWith('/usr/bin/') || path.startsWith('/sbin/')
}

function defaultMode(path, type) {
  if (type === 'dir') return 'drwxr-xr-x'
  if (isExecutablePath(path)) return '-rwxr-xr-x'
  return '-rw-r--r--'
}

function defaultOwner(path) {
  return path.startsWith(`${HOME_PATH}/`) || path === HOME_PATH ? USERNAME : 'root'
}

function defaultGroup(path) {
  return path.startsWith(`${HOME_PATH}/`) || path === HOME_PATH ? USERNAME : 'root'
}

function ensureNodeMetadata(node, path) {
  const now = new Date().toISOString()
  return {
    ...node,
    mode: node.mode || defaultMode(path, node.type),
    owner: node.owner || defaultOwner(path),
    group: node.group || defaultGroup(path),
    ctime: node.ctime || now,
    mtime: node.mtime || now,
  }
}

function sanitizeFileSystem(node, path = '/') {
  if (!node || (node.type !== 'dir' && node.type !== 'file')) {
    return ensureNodeMetadata(dir({}), path)
  }

  if (node.type === 'file') {
    const normalized = ensureNodeMetadata(
      { ...node, content: typeof node.content === 'string' ? node.content : '' },
      path
    )
    return normalized
  }

  const children = {}
  for (const [name, child] of Object.entries(node.children || {})) {
    const childPath = path === '/' ? `/${name}` : `${path}/${name}`
    children[name] = sanitizeFileSystem(child, childPath)
  }

  return ensureNodeMetadata({ ...node, children }, path)
}

function formatLsTime(iso) {
  const date = new Date(iso || Date.now())
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatStatTime(iso) {
  const date = new Date(iso || Date.now())
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatUptimeFromBoot(bootTimestamp) {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - bootTimestamp) / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pieces = []
  if (days > 0) pieces.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0) pieces.push(`${hours}:${String(minutes).padStart(2, '0')}`)
  else pieces.push(`${minutes} min`)
  pieces.push(`${seconds} sec`)
  return pieces.join(', ')
}

function buildCalendarText(month = new Date().getMonth(), year = new Date().getFullYear()) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const weekHeader = 'Su Mo Tu We Th Fr Sa'
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const title = `${months[month]} ${year}`
  const lines = [title.padStart(Math.floor((20 + title.length) / 2), ' '), weekHeader]
  let line = ''.padStart(firstDay * 3, ' ')
  for (let day = 1; day <= daysInMonth; day += 1) {
    line += `${String(day).padStart(2, ' ')} `
    if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
      lines.push(line.trimEnd())
      line = ''
    }
  }
  return lines.join('\n')
}

function applyExecutablePermission(mode) {
  const chars = mode.split('')
  if (chars[3] !== '-') chars[3] = 'x'
  if (chars[6] !== '-') chars[6] = 'x'
  if (chars[9] !== '-') chars[9] = 'x'
  if (chars[3] === '-') chars[3] = 'x'
  if (chars[6] === '-') chars[6] = 'x'
  if (chars[9] === '-') chars[9] = 'x'
  return chars.join('')
}

function octalToMode(octal, type) {
  const digits = octal.split('').map((value) => Number(value))
  if (digits.length !== 3 || digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 7)) {
    return null
  }
  const symbol = type === 'dir' ? 'd' : '-'
  const mapDigit = (digit) => `${digit & 4 ? 'r' : '-'}${digit & 2 ? 'w' : '-'}${digit & 1 ? 'x' : '-'}`
  return `${symbol}${mapDigit(digits[0])}${mapDigit(digits[1])}${mapDigit(digits[2])}`
}
function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function splitNanoContent(content) {
  const normalized = content.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  return lines.length > 0 ? lines : ['']
}

function createNanoSession(path, content) {
  const normalizedContent = (content || '').replace(/\r\n/g, '\n')
  return {
    path,
    lines: splitNanoContent(normalizedContent),
    originalContent: normalizedContent,
    cursorRow: 0,
    cursorCol: 0,
    preferredCol: 0,
    viewportTop: 0,
    cutBuffer: [],
    lastAction: null,
    prompt: null,
    statusMessage: '[ Entering nano ]',
    dirty: false,
    lastSearch: '',
  }
}

function nanoContent(session) {
  return session.lines.join('\n')
}

function ensureNanoViewport(session) {
  const maxTop = Math.max(0, session.lines.length - NANO_VIEWPORT_LINES)
  let nextTop = session.viewportTop

  if (session.cursorRow < nextTop) {
    nextTop = session.cursorRow
  }
  if (session.cursorRow >= nextTop + NANO_VIEWPORT_LINES) {
    nextTop = session.cursorRow - NANO_VIEWPORT_LINES + 1
  }

  nextTop = clampNumber(nextTop, 0, maxTop)
  if (nextTop === session.viewportTop) return session
  return { ...session, viewportTop: nextTop }
}

function setNanoCursor(session, row, col, keepPreferred = false) {
  const nextRow = clampNumber(row, 0, session.lines.length - 1)
  const nextCol = clampNumber(col, 0, session.lines[nextRow].length)
  const nextSession = {
    ...session,
    cursorRow: nextRow,
    cursorCol: nextCol,
    preferredCol: keepPreferred ? session.preferredCol : nextCol,
  }
  return ensureNanoViewport(nextSession)
}

function nanoMoveLeft(session) {
  if (session.cursorCol > 0) {
    return setNanoCursor(session, session.cursorRow, session.cursorCol - 1)
  }
  if (session.cursorRow > 0) {
    const prevLineLength = session.lines[session.cursorRow - 1].length
    return setNanoCursor(session, session.cursorRow - 1, prevLineLength)
  }
  return session
}

function nanoMoveRight(session) {
  const currentLineLength = session.lines[session.cursorRow].length
  if (session.cursorCol < currentLineLength) {
    return setNanoCursor(session, session.cursorRow, session.cursorCol + 1)
  }
  if (session.cursorRow < session.lines.length - 1) {
    return setNanoCursor(session, session.cursorRow + 1, 0)
  }
  return session
}

function nanoMoveUp(session) {
  if (session.cursorRow === 0) return session
  const nextRow = session.cursorRow - 1
  const nextCol = Math.min(session.preferredCol, session.lines[nextRow].length)
  return ensureNanoViewport({
    ...session,
    cursorRow: nextRow,
    cursorCol: nextCol,
  })
}

function nanoMoveDown(session) {
  if (session.cursorRow >= session.lines.length - 1) return session
  const nextRow = session.cursorRow + 1
  const nextCol = Math.min(session.preferredCol, session.lines[nextRow].length)
  return ensureNanoViewport({
    ...session,
    cursorRow: nextRow,
    cursorCol: nextCol,
  })
}

function nanoPageUp(session) {
  const nextRow = clampNumber(
    session.cursorRow - NANO_VIEWPORT_LINES,
    0,
    session.lines.length - 1
  )
  const nextCol = Math.min(session.preferredCol, session.lines[nextRow].length)
  const maxTop = Math.max(0, session.lines.length - NANO_VIEWPORT_LINES)
  const nextTop = clampNumber(session.viewportTop - NANO_VIEWPORT_LINES, 0, maxTop)
  return {
    ...session,
    cursorRow: nextRow,
    cursorCol: nextCol,
    viewportTop: nextTop,
  }
}

function nanoPageDown(session) {
  const nextRow = clampNumber(
    session.cursorRow + NANO_VIEWPORT_LINES,
    0,
    session.lines.length - 1
  )
  const nextCol = Math.min(session.preferredCol, session.lines[nextRow].length)
  const maxTop = Math.max(0, session.lines.length - NANO_VIEWPORT_LINES)
  const nextTop = clampNumber(session.viewportTop + NANO_VIEWPORT_LINES, 0, maxTop)
  return {
    ...session,
    cursorRow: nextRow,
    cursorCol: nextCol,
    viewportTop: nextTop,
  }
}

function nanoInsertText(session, text) {
  if (!text) return session

  const normalizedText = text.replace(/\r\n/g, '\n')
  const chunks = normalizedText.split('\n')
  const lines = [...session.lines]
  const currentLine = lines[session.cursorRow]
  const before = currentLine.slice(0, session.cursorCol)
  const after = currentLine.slice(session.cursorCol)

  if (chunks.length === 1) {
    lines[session.cursorRow] = before + chunks[0] + after
    const nextCol = session.cursorCol + chunks[0].length
    return ensureNanoViewport({
      ...session,
      lines,
      cursorCol: nextCol,
      preferredCol: nextCol,
      prompt: null,
      statusMessage: '',
      dirty: true,
      lastAction: 'insert',
    })
  }

  const firstLine = before + chunks[0]
  const middleLines = chunks.slice(1, -1)
  const lastLine = chunks[chunks.length - 1] + after

  lines.splice(session.cursorRow, 1, firstLine, ...middleLines, lastLine)
  const nextRow = session.cursorRow + chunks.length - 1
  const nextCol = chunks[chunks.length - 1].length

  return ensureNanoViewport({
    ...session,
    lines,
    cursorRow: nextRow,
    cursorCol: nextCol,
    preferredCol: nextCol,
    prompt: null,
    statusMessage: '',
    dirty: true,
    lastAction: 'insert',
  })
}

function nanoInsertNewline(session) {
  return nanoInsertText(session, '\n')
}

function nanoBackspace(session) {
  if (session.cursorRow === 0 && session.cursorCol === 0) return session

  const lines = [...session.lines]
  if (session.cursorCol > 0) {
    const currentLine = lines[session.cursorRow]
    lines[session.cursorRow] =
      currentLine.slice(0, session.cursorCol - 1) +
      currentLine.slice(session.cursorCol)
    const nextCol = session.cursorCol - 1
    return ensureNanoViewport({
      ...session,
      lines,
      cursorCol: nextCol,
      preferredCol: nextCol,
      statusMessage: '',
      dirty: true,
      lastAction: 'insert',
    })
  }

  const prevLine = lines[session.cursorRow - 1]
  const currentLine = lines[session.cursorRow]
  const nextCol = prevLine.length
  lines.splice(session.cursorRow - 1, 2, prevLine + currentLine)

  return ensureNanoViewport({
    ...session,
    lines,
    cursorRow: session.cursorRow - 1,
    cursorCol: nextCol,
    preferredCol: nextCol,
    statusMessage: '',
    dirty: true,
    lastAction: 'insert',
  })
}

function nanoDelete(session) {
  const lines = [...session.lines]
  const currentLine = lines[session.cursorRow]

  if (session.cursorCol < currentLine.length) {
    lines[session.cursorRow] =
      currentLine.slice(0, session.cursorCol) +
      currentLine.slice(session.cursorCol + 1)
    return ensureNanoViewport({
      ...session,
      lines,
      statusMessage: '',
      dirty: true,
      lastAction: 'insert',
    })
  }

  if (session.cursorRow >= lines.length - 1) return session

  const nextLine = lines[session.cursorRow + 1]
  lines.splice(session.cursorRow, 2, currentLine + nextLine)
  return ensureNanoViewport({
    ...session,
    lines,
    statusMessage: '',
    dirty: true,
    lastAction: 'insert',
  })
}

function nanoCutLine(session) {
  const lines = [...session.lines]
  const cutLine = lines[session.cursorRow]
  const appendedCut =
    session.lastAction === 'cut'
      ? [...session.cutBuffer, cutLine]
      : [cutLine]

  if (lines.length === 1) {
    lines[0] = ''
    return ensureNanoViewport({
      ...session,
      lines,
      cursorRow: 0,
      cursorCol: 0,
      preferredCol: 0,
      cutBuffer: appendedCut,
      statusMessage: '[ Cut line ]',
      dirty: true,
      lastAction: 'cut',
    })
  }

  lines.splice(session.cursorRow, 1)
  const nextRow = Math.min(session.cursorRow, lines.length - 1)

  return ensureNanoViewport({
    ...session,
    lines,
    cursorRow: nextRow,
    cursorCol: 0,
    preferredCol: 0,
    cutBuffer: appendedCut,
    statusMessage: '[ Cut line ]',
    dirty: true,
    lastAction: 'cut',
  })
}

function nanoCopyLine(session) {
  return {
    ...session,
    cutBuffer: [session.lines[session.cursorRow]],
    statusMessage: '[ Copied line ]',
    lastAction: 'copy',
  }
}

function nanoUncut(session) {
  if (session.cutBuffer.length === 0) {
    return { ...session, statusMessage: '[ Cutbuffer is empty ]' }
  }
  const pasted = nanoInsertText(session, session.cutBuffer.join('\n'))
  return {
    ...pasted,
    statusMessage: '[ Uncut text ]',
    lastAction: 'uncut',
  }
}

function nanoFind(session, query) {
  const needle = query.trim()
  if (!needle) {
    return { ...session, prompt: null, statusMessage: '[ Search cancelled ]' }
  }

  const lowerNeedle = needle.toLowerCase()
  const startRow = session.cursorRow
  const startCol = session.cursorCol + 1

  let foundRow = -1
  let foundCol = -1
  let wrapped = false

  for (let pass = 0; pass < 2 && foundRow === -1; pass += 1) {
    const rowStart = pass === 0 ? startRow : 0
    const rowEnd = pass === 0 ? session.lines.length : startRow + 1

    for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex += 1) {
      const sourceLine = session.lines[rowIndex].toLowerCase()
      const startIndex = pass === 0 && rowIndex === startRow ? startCol : 0
      const foundIndex = sourceLine.indexOf(lowerNeedle, startIndex)
      if (foundIndex !== -1) {
        foundRow = rowIndex
        foundCol = foundIndex
        wrapped = pass === 1
        break
      }
    }
  }

  if (foundRow === -1) {
    return {
      ...session,
      prompt: null,
      lastSearch: needle,
      statusMessage: `[ "${needle}" not found ]`,
    }
  }

  return setNanoCursor(
    {
      ...session,
      prompt: null,
      lastSearch: needle,
      statusMessage: wrapped
        ? `[ Wrapped and found "${needle}" ]`
        : `[ Found "${needle}" ]`,
    },
    foundRow,
    foundCol
  )
}

function nanoGoto(session, rawValue) {
  const value = rawValue.trim()
  const match = value.match(/^(\d+)(?:\s*,\s*(\d+))?$/)
  if (!match) {
    return {
      ...session,
      prompt: null,
      statusMessage: '[ Invalid line/column ]',
    }
  }

  const lineNumber = Number(match[1])
  const columnNumber = match[2] ? Number(match[2]) : 1

  const row = clampNumber(lineNumber - 1, 0, session.lines.length - 1)
  const col = clampNumber(columnNumber - 1, 0, session.lines[row].length)

  return setNanoCursor(
    {
      ...session,
      prompt: null,
      statusMessage: `[ line ${row + 1}/${session.lines.length}, col ${col + 1} ]`,
    },
    row,
    col
  )
}

function nanoReplaceAll(session, findValue, replaceValue) {
  if (!findValue) {
    return {
      ...session,
      prompt: null,
      statusMessage: '[ Replace cancelled ]',
    }
  }

  let replacementCount = 0
  const lines = session.lines.map((line) => {
    const fragments = line.split(findValue)
    if (fragments.length <= 1) return line
    replacementCount += fragments.length - 1
    return fragments.join(replaceValue)
  })

  if (replacementCount === 0) {
    return {
      ...session,
      prompt: null,
      statusMessage: `[ "${findValue}" not found ]`,
    }
  }

  const cursorCol = Math.min(session.cursorCol, lines[session.cursorRow].length)
  return ensureNanoViewport({
    ...session,
    lines,
    cursorCol,
    preferredCol: cursorCol,
    prompt: null,
    dirty: true,
    lastAction: 'insert',
    statusMessage: `[ Replaced ${replacementCount} occurrence${replacementCount === 1 ? '' : 's'} ]`,
  })
}

function createPrompt(type, label, initialValue = '', extra = {}) {
  return {
    type,
    label,
    value: initialValue,
    cursor: initialValue.length,
    ...extra,
  }
}

function updatePromptValue(prompt, nextValue, nextCursor = nextValue.length) {
  return {
    ...prompt,
    value: nextValue,
    cursor: clampNumber(nextCursor, 0, nextValue.length),
  }
}

function promptInsertText(prompt, text) {
  if (!text) return prompt
  const nextValue =
    prompt.value.slice(0, prompt.cursor) +
    text +
    prompt.value.slice(prompt.cursor)
  return updatePromptValue(prompt, nextValue, prompt.cursor + text.length)
}

function formatNanoPosition(session) {
  return `line ${session.cursorRow + 1}/${session.lines.length} col ${session.cursorCol + 1}`
}

function App() {
  const [fileSystem, setFileSystem] = useState(loadFileSystemFromStorage)
  const [installedPackages, setInstalledPackages] = useState(loadInstalledPackagesFromStorage)
  const [processTable, setProcessTable] = useState(createDefaultProcesses)
  const [bootTimestamp] = useState(loadBootTimestamp)
  const [currentPath, setCurrentPath] = useState(HOME_PATH)
  const [history, setHistory] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [cursorIndex, setCursorIndex] = useState(0)
  const [commandHistory, setCommandHistory] = useState([])
  const [historyCursor, setHistoryCursor] = useState(-1)
  const [historyDraft, setHistoryDraft] = useState('')
  const [nanoSession, setNanoSession] = useState(null)

  const inputRef = useRef(null)
  const nanoInputRef = useRef(null)
  const bodyRef = useRef(null)
  const inputValueRef = useRef('')
  const cursorIndexRef = useRef(0)

  useEffect(() => {
    inputValueRef.current = inputValue
  }, [inputValue])

  useEffect(() => {
    cursorIndexRef.current = cursorIndex
  }, [cursorIndex])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fileSystem))
    } catch {
      // Keep terminal running even if storage is unavailable.
    }
  }, [fileSystem])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_PACKAGES_KEY,
        JSON.stringify(installedPackages)
      )
    } catch {
      // Keep terminal running even if storage is unavailable.
    }
  }, [installedPackages])

  useEffect(() => {
    if (nanoSession) {
      nanoInputRef.current?.focus()
    } else {
      inputRef.current?.focus()
    }
  }, [nanoSession])

  useEffect(() => {
    if (!bodyRef.current || nanoSession) return
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [history, inputValue, nanoSession])

  const setCommandLine = (nextValue, nextCursor = nextValue.length) => {
    const safeCursor = Math.max(0, Math.min(nextCursor, nextValue.length))
    inputValueRef.current = nextValue
    cursorIndexRef.current = safeCursor
    setInputValue(nextValue)
    setCursorIndex(safeCursor)
  }

  const insertTextInCommandLine = (text) => {
    if (!text) return
    const currentValue = inputValueRef.current
    const currentCursor = cursorIndexRef.current
    const nextValue = `${currentValue.slice(0, currentCursor)}${text}${currentValue.slice(currentCursor)}`
    setCommandLine(nextValue, currentCursor + text.length)
  }

  const appendHistoryLines = (lines) => {
    if (!lines || lines.length === 0) return
    setHistory((previous) => [...previous, ...lines])
  }

  const withNanoSession = (updater) => {
    setNanoSession((previous) => (previous ? updater(previous) : previous))
  }

  const handleFocus = () => {
    if (nanoSession) {
      nanoInputRef.current?.focus()
      return
    }
    inputRef.current?.focus()
  }

  const saveNanoBuffer = ({ exitAfterSave = false } = {}) => {
    if (!nanoSession) return false

    const contentToWrite = nanoContent(nanoSession)
    const saveResult = writeFileAtPath(fileSystem, nanoSession.path, contentToWrite)
    if (saveResult.error) {
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: saveResult.error,
        prompt: null,
      }))
      return false
    }

    setFileSystem(saveResult.root)

    if (exitAfterSave) {
      setNanoSession(null)
      return true
    }

    const writtenLineCount = nanoSession.lines.length
    withNanoSession((previous) => ({
      ...previous,
      originalContent: contentToWrite,
      dirty: false,
      prompt: null,
      statusMessage: `[ Wrote ${writtenLineCount} line${writtenLineCount === 1 ? '' : 's'} ]`,
      lastAction: null,
    }))
    return true
  }

  const exitNano = ({ force = false } = {}) => {
    if (!nanoSession) return

    if (!force && nanoSession.dirty) {
      withNanoSession((previous) => ({
        ...previous,
        prompt: {
          type: 'confirm-exit',
          label: 'Save modified buffer (ANSWERING "No" WILL DESTROY CHANGES) ?',
        },
      }))
      return
    }
    setNanoSession(null)
  }
  const executeCommand = (rawInput, executionPath, executionFileSystem) => {
    const commandParts = tokenize(rawInput.trim())
    const result = {
      lines: [],
      nextPath: null,
      nextFileSystem: null,
      nextNanoSession: undefined,
      nextPackages: null,
      nextProcesses: null,
      clearHistory: false,
    }

    if (commandParts.length === 0) return result

    const commandName = commandParts[0]
    const command = commandName.toLowerCase()
    const args = commandParts.slice(1)

    if (command === '--help') {
      result.lines.push({
        type: 'output',
        text: `Use: <command> --help\nTry: help`,
      })
      return result
    }

    if (args.includes('--help')) {
      const usage = usageForCommand(command)
      if (usage) {
        result.lines.push({ type: 'output', text: `Usage: ${usage}` })
        return result
      }
    }

    if (command === 'ls') {
      let showAll = false
      let longFormat = false
      let pathArg = null

      for (const arg of args) {
        if (arg.startsWith('-')) {
          for (const flag of arg.slice(1).split('')) {
            if (flag === 'a') {
              showAll = true
              continue
            }
            if (flag === 'l') {
              longFormat = true
              continue
            }
            result.lines.push({
              type: 'error',
              text: `ls: invalid option -- '${flag}'`,
            })
            return result
          }
          continue
        }
        if (pathArg) {
          result.lines.push({
            type: 'error',
            text: 'ls: too many arguments',
          })
          return result
        }
        pathArg = arg
      }

      const targetPath = normalizePath(pathArg || '.', executionPath)
      const node = getNodeAtPath(executionFileSystem, targetPath)

      if (!node) {
        result.lines.push({
          type: 'error',
          text: `ls: cannot access '${pathArg || '.'}': No such file or directory`,
        })
        return result
      }

      if (node.type === 'file') {
        const normalizedNode = ensureNodeMetadata(node, targetPath)
        if (longFormat) {
          const line = `${normalizedNode.mode} 1 ${normalizedNode.owner} ${normalizedNode.group} ${normalizedNode.content.length
            .toString()
            .padStart(6, ' ')} ${formatLsTime(normalizedNode.mtime)} ${getBaseName(targetPath)}`
          result.lines.push({ type: 'output', text: line })
        } else {
          result.lines.push({
            type: 'output',
            text: getBaseName(targetPath),
          })
        }
        return result
      }

      const sortedNames = Object.keys(node.children).sort((a, b) =>
        a.localeCompare(b)
      )

      const names = sortedNames.filter((name) => showAll || !name.startsWith('.'))
      if (longFormat) {
        const detailRows = []
        const listing = showAll ? ['.', '..', ...names] : names
        for (const name of listing) {
          if (name === '.') {
            const selfNode = ensureNodeMetadata(node, targetPath)
            detailRows.push(
              `${selfNode.mode} 2 ${selfNode.owner} ${selfNode.group} ${String(
                Object.keys(node.children).length
              ).padStart(6, ' ')} ${formatLsTime(selfNode.mtime)} .`
            )
            continue
          }
          if (name === '..') {
            const parentPath = normalizePath('..', targetPath)
            const parentNode = getNodeAtPath(executionFileSystem, parentPath)
            const normalizedParent = ensureNodeMetadata(
              parentNode || dir({}),
              parentPath
            )
            detailRows.push(
              `${normalizedParent.mode} 2 ${normalizedParent.owner} ${normalizedParent.group} ${String(
                parentNode && parentNode.type === 'dir'
                  ? Object.keys(parentNode.children).length
                  : 0
              ).padStart(6, ' ')} ${formatLsTime(normalizedParent.mtime)} ..`
            )
            continue
          }
          const childPath = targetPath === '/' ? `/${name}` : `${targetPath}/${name}`
          const childNode = ensureNodeMetadata(node.children[name], childPath)
          const size =
            childNode.type === 'file'
              ? childNode.content.length
              : Object.keys(childNode.children).length
          detailRows.push(
            `${childNode.mode} ${childNode.type === 'dir' ? 2 : 1} ${childNode.owner} ${childNode.group} ${String(
              size
            ).padStart(6, ' ')} ${formatLsTime(childNode.mtime)} ${name}`
          )
        }
        result.lines.push({ type: 'output', text: detailRows.join('\n') })
      } else {
        const output = showAll ? ['.', '..', ...names].join('  ') : names.join('  ')
        result.lines.push({ type: 'output', text: output })
      }
      return result
    }

    if (command === 'cd') {
      if (args.length > 1) {
        result.lines.push({ type: 'error', text: 'cd: too many arguments' })
        return result
      }

      const targetPath = normalizePath(args[0] || '~', executionPath)
      const node = getNodeAtPath(executionFileSystem, targetPath)

      if (!node) {
        result.lines.push({
          type: 'error',
          text: `cd: ${args[0] || '~'}: No such file or directory`,
        })
        return result
      }

      if (node.type !== 'dir') {
        result.lines.push({
          type: 'error',
          text: `cd: ${args[0] || '~'}: Not a directory`,
        })
        return result
      }

      result.nextPath = targetPath
      return result
    }

    if (command === 'touch') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'touch: missing file operand' })
        return result
      }

      let workingFileSystem = executionFileSystem
      let changed = false
      for (const arg of args) {
        const targetPath = normalizePath(arg, executionPath)
        const touchResult = touchPath(workingFileSystem, targetPath)
        if (touchResult.error) {
          result.lines.push({ type: 'error', text: touchResult.error })
          continue
        }
        workingFileSystem = touchResult.root
        changed = true
      }
      if (changed) {
        result.nextFileSystem = workingFileSystem
      }
      return result
    }

    if (command === 'rmdir') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'rmdir: missing operand' })
        return result
      }

      let workingFileSystem = executionFileSystem
      let changed = false
      for (const arg of args) {
        const targetPath = normalizePath(arg, executionPath)
        const removeResult = removeDirectoryPath(workingFileSystem, targetPath)
        if (removeResult.error) {
          result.lines.push({ type: 'error', text: removeResult.error })
          continue
        }
        workingFileSystem = removeResult.root
        changed = true
      }
      if (changed) result.nextFileSystem = workingFileSystem
      return result
    }

    if (command === 'rm') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'rm: missing operand' })
        return result
      }

      let recursive = false
      const targets = []
      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('r')) recursive = true
          continue
        }
        targets.push(arg)
      }
      if (targets.length === 0) {
        result.lines.push({ type: 'error', text: 'rm: missing operand' })
        return result
      }

      let workingFileSystem = executionFileSystem
      let changed = false
      for (const target of targets) {
        const targetPath = normalizePath(target, executionPath)
        const removeResult = removePath(workingFileSystem, targetPath, recursive)
        if (removeResult.error) {
          result.lines.push({ type: 'error', text: removeResult.error })
          continue
        }
        workingFileSystem = removeResult.root
        changed = true
      }
      if (changed) result.nextFileSystem = workingFileSystem
      return result
    }

    if (command === 'cp') {
      let recursive = false
      const values = []
      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('r')) recursive = true
          continue
        }
        values.push(arg)
      }
      if (values.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'cp: missing destination file operand',
        })
        return result
      }
      const sourcePath = normalizePath(values[0], executionPath)
      const destinationPath = normalizePath(values[1], executionPath)
      const copyResult = copyPath(
        executionFileSystem,
        sourcePath,
        destinationPath,
        recursive
      )
      if (copyResult.error) {
        result.lines.push({ type: 'error', text: copyResult.error })
        return result
      }
      result.nextFileSystem = copyResult.root
      return result
    }

    if (command === 'mv') {
      if (args.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'mv: missing destination file operand',
        })
        return result
      }
      const sourcePath = normalizePath(args[0], executionPath)
      const destinationPath = normalizePath(args[1], executionPath)
      const moveResult = movePath(executionFileSystem, sourcePath, destinationPath)
      if (moveResult.error) {
        result.lines.push({ type: 'error', text: moveResult.error })
        return result
      }
      result.nextFileSystem = moveResult.root
      return result
    }

    if (command === 'stat') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'stat: missing operand' })
        return result
      }

      const rows = []
      for (const arg of args) {
        const targetPath = normalizePath(arg, executionPath)
        const node = getNodeAtPath(executionFileSystem, targetPath)
        if (!node) {
          rows.push(`stat: cannot stat '${arg}': No such file or directory`)
          continue
        }
        const meta = ensureNodeMetadata(node, targetPath)
        const size =
          node.type === 'file' ? node.content.length : Object.keys(node.children).length
        rows.push(
          [
            `  File: ${targetPath}`,
            `  Size: ${size}\tType: ${node.type === 'dir' ? 'directory' : 'regular file'}`,
            `Access: (${formatPermissionOctal(meta.mode)}/${meta.mode})  Uid: (${meta.owner})   Gid: (${meta.group})`,
            `Modify: ${formatStatTime(meta.mtime)}`,
            `Change: ${formatStatTime(meta.ctime)}`,
          ].join('\n')
        )
      }
      result.lines.push({ type: 'output', text: rows.join('\n') })
      return result
    }

    if (command === 'cat') {
      if (args.length === 0) {
        result.lines.push({
          type: 'error',
          text: 'cat: missing file operand',
        })
        return result
      }

      for (const arg of args) {
        const targetPath = normalizePath(arg, executionPath)
        const node = getNodeAtPath(executionFileSystem, targetPath)

        if (!node) {
          result.lines.push({
            type: 'error',
            text: `cat: ${arg}: No such file or directory`,
          })
          continue
        }

        if (node.type !== 'file') {
          result.lines.push({
            type: 'error',
            text: `cat: ${arg}: Is a directory`,
          })
          continue
        }

        result.lines.push({
          type: 'output',
          text: node.content,
        })
      }

      return result
    }

    if (command === 'head' || command === 'tail') {
      if (args.length === 0) {
        result.lines.push({
          type: 'error',
          text: `${command}: missing file operand`,
        })
        return result
      }

      let lineCount = 10
      let follow = false
      const files = []
      for (let index = 0; index < args.length; index += 1) {
        const arg = args[index]
        if (arg === '-n') {
          const value = Number(args[index + 1])
          if (!Number.isFinite(value)) {
            result.lines.push({
              type: 'error',
              text: `${command}: invalid number of lines`,
            })
            return result
          }
          lineCount = Math.max(1, Math.floor(value))
          index += 1
          continue
        }
        if (arg === '-f' && command === 'tail') {
          follow = true
          continue
        }
        files.push(arg)
      }

      if (files.length === 0) {
        result.lines.push({
          type: 'error',
          text: `${command}: missing file operand`,
        })
        return result
      }

      const outputs = []
      for (const entry of files) {
        const targetPath = normalizePath(entry, executionPath)
        const node = getNodeAtPath(executionFileSystem, targetPath)
        if (!node) {
          outputs.push(`${command}: cannot open '${entry}' for reading: No such file or directory`)
          continue
        }
        if (node.type !== 'file') {
          outputs.push(`${command}: error reading '${entry}': Is a directory`)
          continue
        }

        const lines = node.content.split('\n')
        const selected =
          command === 'head'
            ? lines.slice(0, lineCount)
            : lines.slice(Math.max(lines.length - lineCount, 0))
        let text = selected.join('\n')
        if (follow && command === 'tail') {
          text += '\n==> waiting for appended data (simulation) <=='
        }
        outputs.push(text)
      }

      result.lines.push({ type: 'output', text: outputs.join('\n') })
      return result
    }

    if (command === 'less' || command === 'more') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: `${command}: missing file operand` })
        return result
      }
      const targetPath = normalizePath(args[0], executionPath)
      const node = getNodeAtPath(executionFileSystem, targetPath)
      if (!node) {
        result.lines.push({
          type: 'error',
          text: `${command}: ${args[0]}: No such file or directory`,
        })
        return result
      }
      if (node.type !== 'file') {
        result.lines.push({
          type: 'error',
          text: `${command}: ${args[0]}: Is a directory`,
        })
        return result
      }
      const lines = node.content.split('\n')
      const pageSize = 20
      const pages = []
      for (let index = 0; index < lines.length; index += pageSize) {
        const chunk = lines.slice(index, index + pageSize).join('\n')
        const marker = index + pageSize < lines.length ? '\n--More--' : ''
        pages.push(chunk + marker)
      }
      result.lines.push({ type: 'output', text: pages.join('\n') })
      return result
    }

    if (command === 'mkdir') {
      if (args.length === 0) {
        result.lines.push({
          type: 'error',
          text: 'mkdir: missing operand',
        })
        return result
      }

      let workingFileSystem = executionFileSystem
      let changed = false

      for (const arg of args) {
        const targetPath = normalizePath(arg, executionPath)
        const mkdirResult = createDirectoryAtPath(workingFileSystem, targetPath)

        if (mkdirResult.error) {
          result.lines.push({ type: 'error', text: mkdirResult.error })
          continue
        }

        workingFileSystem = mkdirResult.root
        changed = true
      }

      if (changed) {
        result.nextFileSystem = workingFileSystem
      }

      return result
    }

    if (command === 'find') {
      const startArg = args[0] && !args[0].startsWith('-') ? args[0] : '.'
      const rootPath = normalizePath(startArg, executionPath)
      const rootNode = getNodeAtPath(executionFileSystem, rootPath)
      if (!rootNode) {
        result.lines.push({
          type: 'error',
          text: `find: '${startArg}': No such file or directory`,
        })
        return result
      }

      let namePattern = null
      const nameFlagIndex = args.findIndex((item) => item === '-name')
      if (nameFlagIndex !== -1) {
        namePattern = args[nameFlagIndex + 1] || null
      }

      const matcher = (path) => {
        if (!namePattern) return true
        const baseName = getBaseName(path)
        const regex = new RegExp(
          `^${namePattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')}$`
        )
        return regex.test(baseName)
      }

      const matches = []
      walkFileSystem(rootNode, rootPath, (_, path) => {
        if (matcher(path)) matches.push(path)
      })
      result.lines.push({ type: 'output', text: matches.join('\n') })
      return result
    }

    if (command === 'locate') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'locate: missing pattern' })
        return result
      }
      const term = args.join(' ').toLowerCase()
      const matches = []
      walkFileSystem(executionFileSystem, '/', (_, path) => {
        if (path.toLowerCase().includes(term)) matches.push(path)
      })
      result.lines.push({ type: 'output', text: matches.join('\n') || '' })
      return result
    }

    if (command === 'grep') {
      if (args.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'grep: usage: grep [-r] PATTERN FILE...',
        })
        return result
      }

      let recursive = false
      const values = []
      for (const arg of args) {
        if (arg === '-r' || arg === '-R') {
          recursive = true
          continue
        }
        values.push(arg)
      }

      if (values.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'grep: missing file operand',
        })
        return result
      }

      const pattern = values[0]
      const targets = values.slice(1)
      const outputs = []

      const scanFile = (displayName, fileNode) => {
        const lines = fileNode.content.split('\n')
        lines.forEach((line, index) => {
          if (line.includes(pattern)) {
            outputs.push(`${displayName}:${index + 1}:${line}`)
          }
        })
      }

      for (const target of targets) {
        const targetPath = normalizePath(target, executionPath)
        const node = getNodeAtPath(executionFileSystem, targetPath)
        if (!node) {
          outputs.push(`grep: ${target}: No such file or directory`)
          continue
        }
        if (node.type === 'file') {
          scanFile(targetPath, node)
          continue
        }
        if (!recursive) {
          outputs.push(`grep: ${target}: Is a directory`)
          continue
        }

        walkFileSystem(node, targetPath, (walkNode, walkPath) => {
          if (walkNode.type === 'file') {
            scanFile(walkPath, walkNode)
          }
        })
      }

      result.lines.push({ type: 'output', text: outputs.join('\n') })
      return result
    }

    if (command === 'which') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'which: missing command name' })
        return result
      }
      const outputs = args
        .map((name) => COMMAND_PATHS[name])
        .filter(Boolean)
        .join('\n')
      result.lines.push({ type: 'output', text: outputs })
      return result
    }

    if (command === 'whereis') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'whereis: missing operand' })
        return result
      }
      const outputs = args.map((name) => {
        const path = COMMAND_PATHS[name] || ''
        const manPath = path ? `/usr/share/man/man1/${name}.1.gz` : ''
        return `${name}: ${path} ${manPath}`.trim()
      })
      result.lines.push({ type: 'output', text: outputs.join('\n') })
      return result
    }

    if (command === 'nano') {
      if (args.length === 0) {
        result.lines.push({
          type: 'error',
          text: 'nano: missing file operand',
        })
        return result
      }

      if (args.length > 1) {
        result.lines.push({
          type: 'error',
          text: 'nano: too many arguments',
        })
        return result
      }

      const targetPath = normalizePath(args[0], executionPath)
      const existingNode = getNodeAtPath(executionFileSystem, targetPath)

      if (existingNode && existingNode.type === 'dir') {
        result.lines.push({
          type: 'error',
          text: `nano: ${args[0]}: Is a directory`,
        })
        return result
      }

      result.nextNanoSession = createNanoSession(
        targetPath,
        existingNode ? existingNode.content : ''
      )
      return result
    }

    if (command === 'chmod') {
      if (args.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'chmod: missing operand',
        })
        return result
      }

      const modeArg = args[0]
      if (!/^[0-7]{3}$/.test(modeArg) && modeArg !== '+x') {
        result.lines.push({
          type: 'error',
          text: `chmod: invalid mode: '${modeArg}'`,
        })
        return result
      }
      let workingFileSystem = executionFileSystem
      let changed = false

      for (const rawTarget of args.slice(1)) {
        const targetPath = normalizePath(rawTarget, executionPath)
        const chmodResult = mutateNodeAtPath(
          workingFileSystem,
          targetPath,
          (node, path) => {
            const meta = ensureNodeMetadata(node, path)
            let nextMode = meta.mode
            if (/^[0-7]{3}$/.test(modeArg)) {
              const octalMode = octalToMode(modeArg, node.type)
              if (!octalMode) return meta
              nextMode = octalMode
            } else if (modeArg === '+x') {
              nextMode = applyExecutablePermission(meta.mode)
            }
            return { ...meta, mode: nextMode, mtime: new Date().toISOString() }
          },
          'chmod'
        )

        if (chmodResult.error) {
          result.lines.push({ type: 'error', text: chmodResult.error })
          continue
        }
        workingFileSystem = chmodResult.root
        changed = true
      }

      if (changed) result.nextFileSystem = workingFileSystem
      return result
    }

    if (command === 'chown') {
      if (args.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'chown: missing operand',
        })
        return result
      }
      const ownerValue = args[0]
      const [owner, group] = ownerValue.split(':')
      let workingFileSystem = executionFileSystem
      let changed = false

      for (const rawTarget of args.slice(1)) {
        const targetPath = normalizePath(rawTarget, executionPath)
        const chownResult = mutateNodeAtPath(
          workingFileSystem,
          targetPath,
          (node, path) => {
            const meta = ensureNodeMetadata(node, path)
            return {
              ...meta,
              owner: owner || meta.owner,
              group: group || meta.group,
              mtime: new Date().toISOString(),
            }
          },
          'chown'
        )

        if (chownResult.error) {
          result.lines.push({ type: 'error', text: chownResult.error })
          continue
        }
        workingFileSystem = chownResult.root
        changed = true
      }

      if (changed) result.nextFileSystem = workingFileSystem
      return result
    }

    if (command === 'chgrp') {
      if (args.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'chgrp: missing operand',
        })
        return result
      }

      const group = args[0]
      let workingFileSystem = executionFileSystem
      let changed = false

      for (const rawTarget of args.slice(1)) {
        const targetPath = normalizePath(rawTarget, executionPath)
        const chgrpResult = mutateNodeAtPath(
          workingFileSystem,
          targetPath,
          (node, path) => ({
            ...ensureNodeMetadata(node, path),
            group,
            mtime: new Date().toISOString(),
          }),
          'chgrp'
        )

        if (chgrpResult.error) {
          result.lines.push({ type: 'error', text: chgrpResult.error })
          continue
        }
        workingFileSystem = chgrpResult.root
        changed = true
      }

      if (changed) result.nextFileSystem = workingFileSystem
      return result
    }

    if (command === 'apt') {
      if (args.length === 0) {
        result.lines.push({
          type: 'error',
          text: 'apt: missing subcommand (update, upgrade, install, remove, search)',
        })
        return result
      }

      const sub = args[0]
      if (sub === 'update') {
        result.lines.push({
          type: 'output',
          text: 'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nReading package lists... Done',
        })
        return result
      }

      if (sub === 'upgrade') {
        result.lines.push({
          type: 'output',
          text: 'Reading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.',
        })
        return result
      }

      if (sub === 'search') {
        const term = (args[1] || '').toLowerCase()
        const hits = AVAILABLE_PACKAGES.filter(
          (pkg) =>
            pkg.name.toLowerCase().includes(term) ||
            pkg.description.toLowerCase().includes(term)
        )
        const output = hits
          .map((pkg) => `${pkg.name}/${pkg.version} - ${pkg.description}`)
          .join('\n')
        result.lines.push({ type: 'output', text: output })
        return result
      }

      if (sub === 'install' || sub === 'remove') {
        const targets = args.slice(1)
        if (targets.length === 0) {
          result.lines.push({
            type: 'error',
            text: `apt ${sub}: no package specified`,
          })
          return result
        }
        const installedSet = new Set(installedPackages)
        for (const pkg of targets) {
          if (sub === 'install') {
            installedSet.add(pkg)
          } else {
            installedSet.delete(pkg)
          }
        }
        result.nextPackages = Array.from(installedSet).sort((a, b) =>
          a.localeCompare(b)
        )
        result.lines.push({
          type: 'output',
          text:
            sub === 'install'
              ? `Installed: ${targets.join(', ')}`
              : `Removed: ${targets.join(', ')}`,
        })
        return result
      }

      result.lines.push({
        type: 'error',
        text: `apt: unknown subcommand '${sub}'`,
      })
      return result
    }

    if (command === 'uname') {
      const hasAll = args.includes('-a')
      result.lines.push({
        type: 'output',
        text: hasAll
          ? 'Linux ubuntu 6.8.0-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
          : 'Linux',
      })
      return result
    }

    if (command === 'hostname') {
      result.lines.push({ type: 'output', text: HOSTNAME })
      return result
    }

    if (command === 'uptime') {
      result.lines.push({
        type: 'output',
        text: `up ${formatUptimeFromBoot(bootTimestamp)},  1 user,  load average: 0.08, 0.06, 0.04`,
      })
      return result
    }

    if (command === 'date') {
      result.lines.push({
        type: 'output',
        text: new Date().toString(),
      })
      return result
    }

    if (command === 'cal') {
      result.lines.push({
        type: 'output',
        text: buildCalendarText(),
      })
      return result
    }

    if (command === 'ps') {
      const header = '  PID TTY          TIME CMD'
      const rows = processTable.map(
        (proc) => `${String(proc.pid).padStart(5, ' ')} ${proc.tty.padEnd(12, ' ')} ${proc.time.padEnd(8, ' ')} ${proc.cmd}`
      )
      result.lines.push({ type: 'output', text: [header, ...rows].join('\n') })
      return result
    }

    if (command === 'top' || command === 'htop') {
      const summary = [
        `top - ${new Date().toLocaleTimeString()} up ${formatUptimeFromBoot(bootTimestamp)}, 1 user, load average: 0.10, 0.07, 0.05`,
        'Tasks: 4 total, 1 running, 3 sleeping, 0 stopped, 0 zombie',
        '%Cpu(s):  3.2 us,  1.0 sy, 95.8 id',
        'MiB Mem :  15938.0 total,   6120.0 free,   4210.0 used,   5608.0 buff/cache',
        '',
        '  PID USER      %CPU %MEM COMMAND',
      ]
      const rows = processTable.map(
        (proc) =>
          `${String(proc.pid).padStart(5, ' ')} ${proc.user.padEnd(8, ' ')} ${String(proc.cpu).padStart(4, ' ')} ${String(proc.mem).padStart(4, ' ')} ${proc.cmd}`
      )
      result.lines.push({ type: 'output', text: [...summary, ...rows].join('\n') })
      return result
    }

    if (command === 'kill') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'kill: usage: kill [-9] pid ...' })
        return result
      }
      const ids = args.filter((arg) => !arg.startsWith('-')).map((arg) => Number(arg))
      if (ids.length === 0 || ids.some((value) => !Number.isFinite(value))) {
        result.lines.push({ type: 'error', text: 'kill: invalid pid' })
        return result
      }

      const nextProcesses = processTable.filter(
        (proc) => !ids.includes(proc.pid) || proc.pid === 1
      )
      result.nextProcesses = nextProcesses
      result.lines.push({ type: 'output', text: '' })
      return result
    }

    if (command === 'pkill') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'pkill: missing pattern' })
        return result
      }
      const pattern = args[0].toLowerCase()
      const nextProcesses = processTable.filter((proc) => {
        if (proc.pid === 1) return true
        return !proc.cmd.toLowerCase().includes(pattern)
      })
      result.nextProcesses = nextProcesses
      result.lines.push({ type: 'output', text: '' })
      return result
    }

    if (command === 'ping') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'ping: missing host operand' })
        return result
      }
      const host = args[0]
      const countIndex = args.findIndex((item) => item === '-c')
      const count =
        countIndex !== -1 && Number.isFinite(Number(args[countIndex + 1]))
          ? Math.max(1, Number(args[countIndex + 1]))
          : 4
      const lines = [`PING ${host} (${host}) 56(84) bytes of data.`]
      for (let i = 1; i <= count; i += 1) {
        const time = (12 + Math.random() * 30).toFixed(2)
        lines.push(`64 bytes from ${host}: icmp_seq=${i} ttl=58 time=${time} ms`)
      }
      lines.push(`--- ${host} ping statistics ---`)
      lines.push(`${count} packets transmitted, ${count} received, 0% packet loss`)
      result.lines.push({ type: 'output', text: lines.join('\n') })
      return result
    }

    if (command === 'ifconfig') {
      result.lines.push({
        type: 'output',
        text:
          'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
          '        inet 192.168.0.42  netmask 255.255.255.0  broadcast 192.168.0.255\n' +
          '        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)',
      })
      return result
    }

    if (command === 'ip' && args[0] === 'a') {
      result.lines.push({
        type: 'output',
        text:
          '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n' +
          '    inet 192.168.0.42/24 brd 192.168.0.255 scope global eth0\n' +
          '       valid_lft forever preferred_lft forever',
      })
      return result
    }

    if (command === 'ip') {
      result.lines.push({ type: 'error', text: 'ip: use "ip a" in this simulator' })
      return result
    }

    if (command === 'netstat') {
      result.lines.push({
        type: 'output',
        text:
          'Active Internet connections (servers and established)\n' +
          'Proto Recv-Q Send-Q Local Address           Foreign Address         State\n' +
          'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\n' +
          'tcp        0      0 192.168.0.42:51422      93.184.216.34:443       ESTABLISHED',
      })
      return result
    }

    if (command === 'curl') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'curl: no URL specified!' })
        return result
      }
      const url = args[0]
      result.lines.push({
        type: 'output',
        text: `<!doctype html>\n<!-- simulated response from ${url} -->\n<html><body>curl simulation</body></html>`,
      })
      return result
    }

    if (command === 'wget') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'wget: missing URL' })
        return result
      }
      const url = args[0]
      let outputName = getBaseName(url)
      const outputIndex = args.findIndex((arg) => arg === '-O')
      if (outputIndex !== -1 && args[outputIndex + 1]) {
        outputName = args[outputIndex + 1]
      }
      const destinationPath = normalizePath(outputName, executionPath)
      const content = `Downloaded from ${url}\nDate: ${new Date().toISOString()}\n`
      const writeResult = writeFileAtPath(executionFileSystem, destinationPath, content)
      if (writeResult.error) {
        result.lines.push({ type: 'error', text: writeResult.error })
        return result
      }
      result.nextFileSystem = writeResult.root
      result.lines.push({
        type: 'output',
        text: `Saving to: '${outputName}'\n${content.length} bytes saved`,
      })
      return result
    }

    if (command === 'tar') {
      if (args.length < 3) {
        result.lines.push({
          type: 'error',
          text: 'tar: usage: tar -cvf archive.tar file... | tar -xvf archive.tar',
        })
        return result
      }
      const modeArg = args[0]
      if (modeArg === '-cvf') {
        const archivePath = normalizePath(args[1], executionPath)
        const inputs = args.slice(2)
        const entries = []
        for (const input of inputs) {
          const inputPath = normalizePath(input, executionPath)
          const node = getNodeAtPath(executionFileSystem, inputPath)
          if (!node) {
            result.lines.push({
              type: 'error',
              text: `tar: ${input}: Cannot stat: No such file or directory`,
            })
            continue
          }
          walkFileSystem(node, inputPath, (walkNode, walkPath) => {
            if (walkNode.type === 'file') {
              entries.push({ path: walkPath, content: walkNode.content })
            }
          })
          if (node.type === 'dir' && entries.length === 0) {
            entries.push({ path: inputPath, content: '' })
          }
        }
        const archiveContent = `TAR_SIM_V1\n${JSON.stringify(entries)}`
        const writeResult = writeFileAtPath(
          executionFileSystem,
          archivePath,
          archiveContent
        )
        if (writeResult.error) {
          result.lines.push({ type: 'error', text: writeResult.error })
          return result
        }
        result.nextFileSystem = writeResult.root
        result.lines.push({ type: 'output', text: entries.map((item) => item.path).join('\n') })
        return result
      }
      if (modeArg === '-xvf') {
        const archivePath = normalizePath(args[1], executionPath)
        const archiveNode = getNodeAtPath(executionFileSystem, archivePath)
        if (!archiveNode || archiveNode.type !== 'file') {
          result.lines.push({ type: 'error', text: `tar: ${args[1]}: Cannot open` })
          return result
        }
        if (!archiveNode.content.startsWith('TAR_SIM_V1\n')) {
          result.lines.push({ type: 'error', text: 'tar: This does not look like a tar archive' })
          return result
        }
        let entries = []
        try {
          entries = JSON.parse(archiveNode.content.slice('TAR_SIM_V1\n'.length))
        } catch {
          result.lines.push({ type: 'error', text: 'tar: Corrupted archive' })
          return result
        }
        let workingFileSystem = executionFileSystem
        const extracted = []
        for (const entry of entries) {
          const relative = entry.path.startsWith('/') ? entry.path.slice(1) : entry.path
          const destinationPath = normalizePath(relative, executionPath)
          const parentPath = destinationPath.split('/').slice(0, -1).join('/') || '/'
          const ensured = ensureDirectoryPath(workingFileSystem, parentPath)
          if (ensured.error) continue
          const writeResult = writeFileAtPath(ensured.root, destinationPath, entry.content)
          if (writeResult.error) continue
          workingFileSystem = writeResult.root
          extracted.push(destinationPath)
        }
        result.nextFileSystem = workingFileSystem
        result.lines.push({ type: 'output', text: extracted.join('\n') })
        return result
      }
    }

    if (command === 'gzip' || command === 'gunzip') {
      if (args.length === 0) {
        result.lines.push({
          type: 'error',
          text: `${command}: missing file operand`,
        })
        return result
      }
      const targetPath = normalizePath(args[0], executionPath)
      const node = getNodeAtPath(executionFileSystem, targetPath)
      if (!node || node.type !== 'file') {
        result.lines.push({ type: 'error', text: `${command}: ${args[0]}: No such file` })
        return result
      }

      if (command === 'gzip') {
        const encoded = btoa(unescape(encodeURIComponent(node.content)))
        const gzPath = `${targetPath}.gz`
        let workingFileSystem = executionFileSystem
        const writeResult = writeFileAtPath(workingFileSystem, gzPath, `GZIP_SIM_V1\n${encoded}`)
        if (writeResult.error) {
          result.lines.push({ type: 'error', text: writeResult.error })
          return result
        }
        workingFileSystem = writeResult.root
        const removeResult = removePath(workingFileSystem, targetPath, false)
        if (removeResult.error) {
          result.lines.push({ type: 'error', text: removeResult.error })
          return result
        }
        result.nextFileSystem = removeResult.root
        return result
      }

      if (!targetPath.endsWith('.gz') || !node.content.startsWith('GZIP_SIM_V1\n')) {
        result.lines.push({ type: 'error', text: `gunzip: ${args[0]}: not in gzip format` })
        return result
      }
      const decoded = decodeURIComponent(escape(atob(node.content.slice('GZIP_SIM_V1\n'.length))))
      const destinationPath = targetPath.slice(0, -3)
      let workingFileSystem = executionFileSystem
      const writeResult = writeFileAtPath(workingFileSystem, destinationPath, decoded)
      if (writeResult.error) {
        result.lines.push({ type: 'error', text: writeResult.error })
        return result
      }
      workingFileSystem = writeResult.root
      const removeResult = removePath(workingFileSystem, targetPath, false)
      if (removeResult.error) {
        result.lines.push({ type: 'error', text: removeResult.error })
        return result
      }
      result.nextFileSystem = removeResult.root
      return result
    }

    if (command === 'zip') {
      if (args.length < 2) {
        result.lines.push({
          type: 'error',
          text: 'zip: usage: zip archive.zip file...',
        })
        return result
      }
      const archivePath = normalizePath(args[0], executionPath)
      const entries = []
      for (const item of args.slice(1)) {
        const itemPath = normalizePath(item, executionPath)
        const node = getNodeAtPath(executionFileSystem, itemPath)
        if (!node) continue
        walkFileSystem(node, itemPath, (walkNode, walkPath) => {
          if (walkNode.type === 'file') {
            entries.push({ path: walkPath, content: walkNode.content })
          }
        })
      }
      const writeResult = writeFileAtPath(
        executionFileSystem,
        archivePath,
        `ZIP_SIM_V1\n${JSON.stringify(entries)}`
      )
      if (writeResult.error) {
        result.lines.push({ type: 'error', text: writeResult.error })
        return result
      }
      result.nextFileSystem = writeResult.root
      result.lines.push({
        type: 'output',
        text: entries.map((entry) => `adding: ${entry.path}`).join('\n'),
      })
      return result
    }

    if (command === 'unzip') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'unzip: missing file operand' })
        return result
      }
      const archivePath = normalizePath(args[0], executionPath)
      const archiveNode = getNodeAtPath(executionFileSystem, archivePath)
      if (!archiveNode || archiveNode.type !== 'file') {
        result.lines.push({ type: 'error', text: `unzip: cannot find ${args[0]}` })
        return result
      }
      if (!archiveNode.content.startsWith('ZIP_SIM_V1\n')) {
        result.lines.push({ type: 'error', text: `unzip:  ${args[0]} is not a zip file` })
        return result
      }
      let entries = []
      try {
        entries = JSON.parse(archiveNode.content.slice('ZIP_SIM_V1\n'.length))
      } catch {
        result.lines.push({ type: 'error', text: 'unzip: corrupted zip file' })
        return result
      }
      let workingFileSystem = executionFileSystem
      const extracted = []
      for (const entry of entries) {
        const relative = entry.path.startsWith('/') ? entry.path.slice(1) : entry.path
        const destinationPath = normalizePath(relative, executionPath)
        const parentPath = destinationPath.split('/').slice(0, -1).join('/') || '/'
        const ensured = ensureDirectoryPath(workingFileSystem, parentPath)
        if (ensured.error) continue
        const writeResult = writeFileAtPath(ensured.root, destinationPath, entry.content)
        if (writeResult.error) continue
        workingFileSystem = writeResult.root
        extracted.push(destinationPath)
      }
      result.nextFileSystem = workingFileSystem
      result.lines.push({ type: 'output', text: extracted.join('\n') })
      return result
    }

    if (command === 'man') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'man: missing command name' })
        return result
      }
      const target = args[0]
      const manText = [
        `NAME`,
        `    ${target} - simulated Linux command`,
        ``,
        `SYNOPSIS`,
        `    ${target} [OPTIONS]`,
        ``,
        `DESCRIPTION`,
        `    This terminal simulator implements a browser-safe version of '${target}'.`,
      ].join('\n')
      result.lines.push({ type: 'output', text: manText })
      return result
    }

    if (command === 'info') {
      if (args.length === 0) {
        result.lines.push({ type: 'error', text: 'info: missing topic' })
        return result
      }
      result.lines.push({
        type: 'output',
        text: `Info entry for '${args[0]}'\nUse 'man ${args[0]}' for manual-style help.`,
      })
      return result
    }

    if (command === 'clear') {
      result.clearHistory = true
      return result
    }

    if (command === 'pwd') {
      result.lines.push({
        type: 'output',
        text: executionPath,
      })
      return result
    }

    if (command === 'help') {
      result.lines.push({
        type: 'output',
        text:
          'Comandos: ls, cd, pwd, mkdir, rmdir, rm, cp, mv, touch, stat, ' +
          'cat, less, more, head, tail, find, locate, grep, which, whereis, ' +
          'chmod, chown, chgrp, apt, uname, hostname, uptime, date, cal, ' +
          'ps, top, htop, kill, pkill, ping, ifconfig, ip a, netstat, curl, wget, ' +
          'tar, gzip, gunzip, zip, unzip, man, info, nano, clear, help',
      })
      return result
    }

    result.lines.push({
      type: 'error',
      text: `${commandName}: command not found`,
    })
    return result
  }

  const runCommand = (typedCommand) => {
    const executionPath = currentPath
    const executionFileSystem = fileSystem

    if (typedCommand.trim()) {
      setCommandHistory((previous) => [...previous, typedCommand])
    }

    setHistoryCursor(-1)
    setHistoryDraft('')
    setCommandLine('', 0)

    const executionResult = executeCommand(
      typedCommand,
      executionPath,
      executionFileSystem
    )

    if (executionResult.clearHistory) {
      setHistory([])
    } else {
      setHistory((previous) => [
        ...previous,
        {
          type: 'command',
          path: executionPath,
          text: typedCommand,
        },
        ...executionResult.lines,
      ])
    }

    if (executionResult.nextPath !== null) {
      setCurrentPath(executionResult.nextPath)
    }

    if (executionResult.nextFileSystem) {
      setFileSystem(executionResult.nextFileSystem)
    }

    if (executionResult.nextPackages) {
      setInstalledPackages(executionResult.nextPackages)
    }

    if (executionResult.nextProcesses) {
      setProcessTable(executionResult.nextProcesses)
    }

    if (executionResult.nextNanoSession !== undefined) {
      setNanoSession(executionResult.nextNanoSession)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (nanoSession) return
    runCommand(inputValueRef.current)
  }

  const navigateHistoryUp = () => {
    if (commandHistory.length === 0) return

    if (historyCursor === -1) {
      setHistoryDraft(inputValueRef.current)
      const nextIndex = commandHistory.length - 1
      setHistoryCursor(nextIndex)
      const nextCommand = commandHistory[nextIndex]
      setCommandLine(nextCommand, nextCommand.length)
      return
    }

    if (historyCursor > 0) {
      const nextIndex = historyCursor - 1
      setHistoryCursor(nextIndex)
      const nextCommand = commandHistory[nextIndex]
      setCommandLine(nextCommand, nextCommand.length)
    }
  }

  const navigateHistoryDown = () => {
    if (historyCursor === -1) return

    if (historyCursor < commandHistory.length - 1) {
      const nextIndex = historyCursor + 1
      setHistoryCursor(nextIndex)
      const nextCommand = commandHistory[nextIndex]
      setCommandLine(nextCommand, nextCommand.length)
      return
    }

    setHistoryCursor(-1)
    setCommandLine(historyDraft, historyDraft.length)
  }

  const handleCommandCopy = async () => {
    const selectionText = window.getSelection?.().toString() || ''
    const textToCopy = selectionText || inputValueRef.current
    if (!textToCopy) return

    const copied = await writeClipboardText(textToCopy)
    if (!copied) {
      appendHistoryLines([
        {
          type: 'error',
          text: 'clipboard: failed to copy (permission denied)',
        },
      ])
    }
  }

  const handleCommandPaste = async () => {
    const clipboardText = await readClipboardText()
    if (clipboardText === null) {
      appendHistoryLines([
        {
          type: 'error',
          text: 'clipboard: failed to paste (permission denied)',
        },
      ])
      return
    }
    const safeText = clipboardText.replace(/\r?\n/g, ' ')
    insertTextInCommandLine(safeText)
  }

  const handleCommandPasteEvent = (event) => {
    event.preventDefault()
    const text = event.clipboardData?.getData('text') || ''
    insertTextInCommandLine(text.replace(/\r?\n/g, ' '))
  }

  const handleCommandEditorClick = () => {
    setCommandLine(inputValueRef.current, inputValueRef.current.length)
    inputRef.current?.focus()
  }

  const handleCommandKeyDown = async (event) => {
    if (nanoSession) return

    const key = event.key
    const lowerKey = key.toLowerCase()
    const ctrlOrMeta = event.ctrlKey || event.metaKey

    const isCopyShortcut =
      (ctrlOrMeta && event.shiftKey && lowerKey === 'c') ||
      (ctrlOrMeta && lowerKey === 'insert')
    const isPasteShortcut =
      (ctrlOrMeta && event.shiftKey && lowerKey === 'v') ||
      (event.shiftKey && lowerKey === 'insert')

    if (isCopyShortcut) {
      event.preventDefault()
      await handleCommandCopy()
      return
    }

    if (isPasteShortcut) {
      event.preventDefault()
      await handleCommandPaste()
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'c') {
      event.preventDefault()
      setHistory((previous) => [
        ...previous,
        {
          type: 'command',
          path: currentPath,
          text: inputValueRef.current,
        },
        { type: 'muted', text: '^C' },
      ])
      setHistoryCursor(-1)
      setHistoryDraft('')
      setCommandLine('', 0)
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'v') {
      event.preventDefault()
      return
    }

    if (key === 'Enter') {
      return
    }

    const currentValue = inputValueRef.current
    const currentCursor = cursorIndexRef.current

    if (key === 'ArrowLeft') {
      event.preventDefault()
      if (currentCursor > 0) {
        setCommandLine(currentValue, currentCursor - 1)
      }
      return
    }

    if (key === 'ArrowRight') {
      event.preventDefault()
      if (currentCursor < currentValue.length) {
        setCommandLine(currentValue, currentCursor + 1)
      }
      return
    }

    if (key === 'Home') {
      event.preventDefault()
      setCommandLine(currentValue, 0)
      return
    }

    if (key === 'End') {
      event.preventDefault()
      setCommandLine(currentValue, currentValue.length)
      return
    }

    if (key === 'Backspace') {
      event.preventDefault()
      if (currentCursor === 0) return
      const nextValue = `${currentValue.slice(0, currentCursor - 1)}${currentValue.slice(currentCursor)}`
      setCommandLine(nextValue, currentCursor - 1)
      return
    }

    if (key === 'Delete') {
      event.preventDefault()
      if (currentCursor >= currentValue.length) return
      const nextValue = `${currentValue.slice(0, currentCursor)}${currentValue.slice(currentCursor + 1)}`
      setCommandLine(nextValue, currentCursor)
      return
    }

    if (key === 'ArrowUp') {
      event.preventDefault()
      navigateHistoryUp()
      return
    }

    if (key === 'ArrowDown') {
      event.preventDefault()
      navigateHistoryDown()
      return
    }

    if (key === 'Tab') {
      event.preventDefault()
      insertTextInCommandLine('  ')
      return
    }

    if (ctrlOrMeta || event.altKey) {
      return
    }

    if (key.length === 1) {
      event.preventDefault()
      insertTextInCommandLine(key)
    }
  }
  const handleNanoCopyShortcut = async () => {
    if (!nanoSession) return
    const selectedText = window.getSelection?.().toString() || ''
    const fallbackLine = nanoSession.lines[nanoSession.cursorRow]
    const textToCopy = selectedText || fallbackLine
    if (!textToCopy) return

    const copied = await writeClipboardText(textToCopy)
    if (!copied) {
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: 'clipboard: failed to copy (permission denied)',
      }))
      return
    }
    withNanoSession((previous) => ({
      ...previous,
      statusMessage: '[ Copied ]',
    }))
  }

  const handleNanoPasteShortcut = async () => {
    const clipboardText = await readClipboardText()
    if (clipboardText === null) {
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: 'clipboard: failed to paste (permission denied)',
      }))
      return
    }

    withNanoSession((previous) =>
      nanoInsertText(
        {
          ...previous,
          prompt: null,
        },
        clipboardText
      )
    )
  }

  const handleNanoPromptInput = (event) => {
    if (!nanoSession?.prompt) return
    const key = event.key
    const lowerKey = key.toLowerCase()
    const ctrlOrMeta = event.ctrlKey || event.metaKey

    if (nanoSession.prompt.type === 'confirm-exit') {
      event.preventDefault()
      if (lowerKey === 'y') {
        saveNanoBuffer({ exitAfterSave: true })
        return
      }
      if (lowerKey === 'n') {
        setNanoSession(null)
        return
      }
      if (lowerKey === 'c' || key === 'Escape') {
        withNanoSession((previous) => ({
          ...previous,
          prompt: null,
          statusMessage: '[ Cancelled ]',
        }))
      }
      return
    }

    event.preventDefault()

    if (ctrlOrMeta && lowerKey === 'c') {
      withNanoSession((previous) => ({
        ...previous,
        prompt: null,
        statusMessage: '[ Cancelled ]',
      }))
      return
    }

    if (key === 'Escape') {
      withNanoSession((previous) => ({
        ...previous,
        prompt: null,
        statusMessage: '[ Cancelled ]',
      }))
      return
    }

    if (key === 'Enter') {
      if (nanoSession.prompt.type === 'search') {
        withNanoSession((previous) => nanoFind(previous, previous.prompt.value))
        return
      }
      if (nanoSession.prompt.type === 'goto') {
        withNanoSession((previous) => nanoGoto(previous, previous.prompt.value))
        return
      }
      if (nanoSession.prompt.type === 'read-file') {
        const requestedPath = nanoSession.prompt.value.trim()
        if (!requestedPath) {
          withNanoSession((previous) => ({
            ...previous,
            prompt: null,
            statusMessage: '[ Read cancelled ]',
          }))
          return
        }

        const targetPath = normalizePath(requestedPath, currentPath)
        const node = getNodeAtPath(fileSystem, targetPath)

        if (!node) {
          withNanoSession((previous) => ({
            ...previous,
            prompt: null,
            statusMessage: `read: ${requestedPath}: No such file`,
          }))
          return
        }

        if (node.type !== 'file') {
          withNanoSession((previous) => ({
            ...previous,
            prompt: null,
            statusMessage: `read: ${requestedPath}: Is a directory`,
          }))
          return
        }

        withNanoSession((previous) => ({
          ...nanoInsertText(
            {
              ...previous,
              prompt: null,
            },
            node.content
          ),
          statusMessage: `[ Read ${node.content.length} chars from ${targetPath} ]`,
        }))
        return
      }
      if (nanoSession.prompt.type === 'replace-find') {
        const findValue = nanoSession.prompt.value
        withNanoSession((previous) => ({
          ...previous,
          prompt: createPrompt(
            'replace-with',
            `Replace "${findValue}" with`,
            '',
            { findValue }
          ),
        }))
        return
      }
      if (nanoSession.prompt.type === 'replace-with') {
        const findValue = nanoSession.prompt.findValue || ''
        const replaceValue = nanoSession.prompt.value
        withNanoSession((previous) =>
          nanoReplaceAll(previous, findValue, replaceValue)
        )
      }
      return
    }

    withNanoSession((previous) => {
      if (!previous.prompt) return previous
      const prompt = previous.prompt

      if (key === 'ArrowLeft') {
        return {
          ...previous,
          prompt: updatePromptValue(prompt, prompt.value, prompt.cursor - 1),
        }
      }
      if (key === 'ArrowRight') {
        return {
          ...previous,
          prompt: updatePromptValue(prompt, prompt.value, prompt.cursor + 1),
        }
      }
      if (key === 'Home') {
        return {
          ...previous,
          prompt: updatePromptValue(prompt, prompt.value, 0),
        }
      }
      if (key === 'End') {
        return {
          ...previous,
          prompt: updatePromptValue(prompt, prompt.value, prompt.value.length),
        }
      }
      if (key === 'Backspace') {
        if (prompt.cursor === 0) return previous
        const nextValue =
          prompt.value.slice(0, prompt.cursor - 1) + prompt.value.slice(prompt.cursor)
        return {
          ...previous,
          prompt: updatePromptValue(prompt, nextValue, prompt.cursor - 1),
        }
      }
      if (key === 'Delete') {
        if (prompt.cursor >= prompt.value.length) return previous
        const nextValue =
          prompt.value.slice(0, prompt.cursor) +
          prompt.value.slice(prompt.cursor + 1)
        return {
          ...previous,
          prompt: updatePromptValue(prompt, nextValue, prompt.cursor),
        }
      }
      if (key.length === 1 && !event.altKey && !ctrlOrMeta) {
        return {
          ...previous,
          prompt: promptInsertText(prompt, key),
        }
      }
      return previous
    })
  }

  const handleNanoKeyDown = async (event) => {
    if (!nanoSession) return

    const key = event.key
    const lowerKey = key.toLowerCase()
    const ctrlOrMeta = event.ctrlKey || event.metaKey
    const altKey = event.altKey

    const isCopyShortcut =
      (ctrlOrMeta && event.shiftKey && lowerKey === 'c') ||
      (ctrlOrMeta && lowerKey === 'insert')
    const isPasteShortcut =
      (ctrlOrMeta && event.shiftKey && lowerKey === 'v') ||
      (event.shiftKey && lowerKey === 'insert')

    if (isCopyShortcut) {
      event.preventDefault()
      await handleNanoCopyShortcut()
      return
    }

    if (isPasteShortcut) {
      event.preventDefault()
      await handleNanoPasteShortcut()
      return
    }

    if (nanoSession.prompt) {
      handleNanoPromptInput(event)
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'x') {
      event.preventDefault()
      exitNano()
      return
    }

    if (ctrlOrMeta && !event.shiftKey && (lowerKey === 'o' || lowerKey === 's')) {
      event.preventDefault()
      saveNanoBuffer()
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'w') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        prompt: createPrompt('search', 'Search', previous.lastSearch || ''),
      }))
      return
    }

    if (
      ctrlOrMeta &&
      ((key === '_' || lowerKey === '_') || (event.code === 'Minus' && event.shiftKey))
    ) {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        prompt: createPrompt('goto', 'Go To Line', ''),
      }))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'k') {
      event.preventDefault()
      withNanoSession((previous) => nanoCutLine(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'u') {
      event.preventDefault()
      withNanoSession((previous) => nanoUncut(previous))
      return
    }

    if (altKey && (event.code === 'Digit6' || key === '^')) {
      event.preventDefault()
      withNanoSession((previous) => nanoCopyLine(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'c') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: `[ ${formatNanoPosition(previous)} ]`,
      }))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'g') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        statusMessage:
          'Nano keys: Ctrl+O save, Ctrl+X exit, Ctrl+W search, Ctrl+_ goto.',
      }))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'r') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        prompt: createPrompt('read-file', 'Read File', ''),
      }))
      return
    }

    if (ctrlOrMeta && key === '\\') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        prompt: createPrompt(
          'replace-find',
          'Search',
          previous.lastSearch || ''
        ),
      }))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'j') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: '[ Justify is not implemented in this simulator ]',
      }))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 't') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: '[ Spell checker is not implemented in this simulator ]',
      }))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'y') {
      event.preventDefault()
      withNanoSession((previous) => nanoPageUp(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'v') {
      event.preventDefault()
      withNanoSession((previous) => nanoPageDown(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'a') {
      event.preventDefault()
      withNanoSession((previous) => setNanoCursor(previous, previous.cursorRow, 0))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'e') {
      event.preventDefault()
      withNanoSession((previous) =>
        setNanoCursor(previous, previous.cursorRow, previous.lines[previous.cursorRow].length)
      )
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'b') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveLeft(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'f') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveRight(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'p') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveUp(previous))
      return
    }

    if (ctrlOrMeta && !event.shiftKey && lowerKey === 'n') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveDown(previous))
      return
    }

    if (key === 'ArrowLeft') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveLeft(previous))
      return
    }

    if (key === 'ArrowRight') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveRight(previous))
      return
    }

    if (key === 'ArrowUp') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveUp(previous))
      return
    }

    if (key === 'ArrowDown') {
      event.preventDefault()
      withNanoSession((previous) => nanoMoveDown(previous))
      return
    }

    if (key === 'PageUp') {
      event.preventDefault()
      withNanoSession((previous) => nanoPageUp(previous))
      return
    }

    if (key === 'PageDown') {
      event.preventDefault()
      withNanoSession((previous) => nanoPageDown(previous))
      return
    }

    if (key === 'Home') {
      event.preventDefault()
      withNanoSession((previous) => setNanoCursor(previous, previous.cursorRow, 0))
      return
    }

    if (key === 'End') {
      event.preventDefault()
      withNanoSession((previous) =>
        setNanoCursor(previous, previous.cursorRow, previous.lines[previous.cursorRow].length)
      )
      return
    }

    if (key === 'Backspace') {
      event.preventDefault()
      withNanoSession((previous) => nanoBackspace(previous))
      return
    }

    if (key === 'Delete') {
      event.preventDefault()
      withNanoSession((previous) => nanoDelete(previous))
      return
    }

    if (key === 'Enter') {
      event.preventDefault()
      withNanoSession((previous) => nanoInsertNewline(previous))
      return
    }

    if (key === 'Tab') {
      event.preventDefault()
      withNanoSession((previous) => nanoInsertText(previous, '\t'))
      return
    }

    if (ctrlOrMeta || altKey) {
      return
    }

    if (key.length === 1) {
      event.preventDefault()
      withNanoSession((previous) => nanoInsertText(previous, key))
    }
  }

  const handleNanoBufferClick = (event, visibleRowIndex) => {
    event.preventDefault()
    nanoInputRef.current?.focus()

    withNanoSession((previous) => {
      const absoluteRow = previous.viewportTop + visibleRowIndex
      if (absoluteRow >= previous.lines.length) return previous

      const line = previous.lines[absoluteRow]
      const rect = event.currentTarget.getBoundingClientRect()
      const relativeX = Math.max(0, event.clientX - rect.left - 6)
      const estimatedCharWidth = 8.35
      const clickedColumn = clampNumber(
        Math.round(relativeX / estimatedCharWidth),
        0,
        line.length
      )
      return setNanoCursor(previous, absoluteRow, clickedColumn)
    })
  }

  const safeCursor = Math.max(0, Math.min(cursorIndex, inputValue.length))
  const beforeCursor = inputValue.slice(0, safeCursor)
  const hasCursorCharacter = safeCursor < inputValue.length
  const cursorCharacter = hasCursorCharacter ? inputValue[safeCursor] : '\u00a0'
  const cursorGlyph = cursorCharacter === ' ' ? '\u00a0' : cursorCharacter
  const afterCursor = hasCursorCharacter ? inputValue.slice(safeCursor + 1) : ''

  const nanoVisibleLines = nanoSession
    ? nanoSession.lines.slice(
        nanoSession.viewportTop,
        nanoSession.viewportTop + NANO_VIEWPORT_LINES
      )
    : []
  const nanoFillerCount = nanoSession
    ? Math.max(0, NANO_VIEWPORT_LINES - nanoVisibleLines.length)
    : 0

  const nanoPrompt = nanoSession?.prompt || null
  const nanoPromptValue = nanoPrompt?.value || ''
  const nanoPromptCursor = nanoPrompt?.cursor || 0
  const nanoPromptBefore = nanoPromptValue.slice(0, nanoPromptCursor)
  const nanoPromptHasCharacter = nanoPromptCursor < nanoPromptValue.length
  const nanoPromptCharacter = nanoPromptHasCharacter
    ? nanoPromptValue[nanoPromptCursor]
    : '\u00a0'
  const nanoPromptAfter = nanoPromptHasCharacter
    ? nanoPromptValue.slice(nanoPromptCursor + 1)
    : ''
  return (
    <div className="desktop">
      <main className="terminal-shell">
        <header className="terminal-header">
          <div className="window-controls" aria-hidden="true">
            <span className="dot dot-close" />
            <span className="dot dot-min" />
            <span className="dot dot-max" />
          </div>
          <p className="terminal-title">
            {USERNAME}@{HOSTNAME}: {formatPromptPath(currentPath)}
          </p>
          <p className="terminal-tab">bash</p>
        </header>

        <section
          className="terminal-body"
          aria-label="Linux terminal"
          onClick={handleFocus}
          ref={bodyRef}
        >
          {history.map((entry, index) => {
            if (entry.type === 'command') {
              return (
                <p className="line line-command" key={`command-${index}`}>
                  <span className="prompt-user">
                    {USERNAME}@{HOSTNAME}
                  </span>
                  <span className="prompt-path">:{formatPromptPath(entry.path)}</span>
                  <span className="prompt-symbol">$</span>
                  <span className="prompt-text">{entry.text || '\u00a0'}</span>
                </p>
              )
            }

            return (
              <p className={`line line-${entry.type}`} key={`${entry.type}-${index}`}>
                {entry.text}
              </p>
            )
          })}

          {nanoSession ? (
            <div className="nano-editor" onClick={() => nanoInputRef.current?.focus()}>
              <div className="nano-topbar">
                <span>GNU nano 8.0</span>
                <span className="nano-topbar-file">
                  {nanoSession.path}
                  {nanoSession.dirty ? ' (Modified)' : ''}
                </span>
              </div>

              <div className="nano-buffer">
                {nanoVisibleLines.map((line, lineIndex) => {
                  const absoluteRow = nanoSession.viewportTop + lineIndex
                  const isCursorRow = absoluteRow === nanoSession.cursorRow

                  if (!isCursorRow) {
                    return (
                      <div
                        className="nano-line"
                        key={`line-${absoluteRow}`}
                        onMouseDown={(event) => handleNanoBufferClick(event, lineIndex)}
                      >
                        {line || '\u00a0'}
                      </div>
                    )
                  }

                  const before = line.slice(0, nanoSession.cursorCol)
                  const hasChar = nanoSession.cursorCol < line.length
                  const char = hasChar ? line[nanoSession.cursorCol] : '\u00a0'
                  const after = hasChar ? line.slice(nanoSession.cursorCol + 1) : ''

                  return (
                    <div
                      className="nano-line nano-line-active"
                      key={`line-${absoluteRow}`}
                      onMouseDown={(event) => handleNanoBufferClick(event, lineIndex)}
                    >
                      <span>{before}</span>
                      <span className="nano-cursor" aria-hidden="true">
                        {char === ' ' ? '\u00a0' : char}
                      </span>
                      <span>{after}</span>
                    </div>
                  )
                })}

                {Array.from({ length: nanoFillerCount }).map((_, fillerIndex) => (
                  <div className="nano-line nano-line-empty" key={`filler-${fillerIndex}`}>
                    {'\u00a0'}
                  </div>
                ))}

                <input
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="nano-input-proxy"
                  onChange={() => {}}
                  onKeyDown={handleNanoKeyDown}
                  ref={nanoInputRef}
                  spellCheck={false}
                  type="text"
                  value=""
                />
              </div>

              <div className="nano-statusbar">
                <span>{nanoSession.statusMessage || '\u00a0'}</span>
                <span>{formatNanoPosition(nanoSession)}</span>
              </div>

              {nanoPrompt ? (
                <div className="nano-prompt-line">
                  {nanoPrompt.type === 'confirm-exit' ? (
                    <span>{nanoPrompt.label} (Y/N/C)</span>
                  ) : (
                    <>
                      <span>{nanoPrompt.label}: </span>
                      <span>{nanoPromptBefore}</span>
                      <span className="nano-cursor nano-cursor-prompt" aria-hidden="true">
                        {nanoPromptCharacter === ' ' ? '\u00a0' : nanoPromptCharacter}
                      </span>
                      <span>{nanoPromptAfter}</span>
                    </>
                  )}
                </div>
              ) : null}

              <div className="nano-shortcuts">
                {NANO_SHORTCUT_ROWS.map((shortcutRow, rowIndex) => (
                  <div className="nano-shortcut-row" key={`shortcut-row-${rowIndex}`}>
                    {shortcutRow.map((shortcut) => {
                      const [shortcutKey, ...rest] = shortcut.split(' ')
                      return (
                        <span className="nano-shortcut" key={`${rowIndex}-${shortcut}`}>
                          <span className="nano-shortcut-key">{shortcutKey}</span>
                          <span>{rest.join(' ')}</span>
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form className="line line-command line-input" onSubmit={handleSubmit}>
              <span className="prompt-user">
                {USERNAME}@{HOSTNAME}
              </span>
              <span className="prompt-path">:{formatPromptPath(currentPath)}</span>
              <span className="prompt-symbol">$</span>
              <div
                className="terminal-editor"
                onClick={handleCommandEditorClick}
                role="textbox"
                tabIndex={-1}
              >
                <span className="terminal-editor-text">{beforeCursor}</span>
                <span className="terminal-cursor" aria-hidden="true">
                  {cursorGlyph}
                </span>
                <span className="terminal-editor-text">{afterCursor}</span>
                <input
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="terminal-input-proxy"
                  onChange={() => {}}
                  onKeyDown={handleCommandKeyDown}
                  onPaste={handleCommandPasteEvent}
                  ref={inputRef}
                  spellCheck={false}
                  type="text"
                  value=""
                />
              </div>
            </form>
          )}
        </section>
      </main>
      <div className="ambient-glow" aria-hidden="true" />
      <div className="ambient-grid" aria-hidden="true" />
    </div>
  )
}

export default App
