import { useEffect, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'terminal_simulator_linux_fs_v1'
const USERNAME = 'dev'
const HOSTNAME = 'ubuntu'
const HOME_PATH = `/home/${USERNAME}`

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

  currentNode.children[name] = dir({})
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
  return { root: cloned, created: !existingNode }
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
    return createDefaultFileSystem()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.type === 'dir') {
        return parsed
      }
    }
  } catch {
    // Ignore parse errors and rebuild.
  }

  const initialFileSystem = createDefaultFileSystem()
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

function createPrompt(type, label, initialValue = '') {
  return {
    type,
    label,
    value: initialValue,
    cursor: initialValue.length,
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
    }

    if (commandParts.length === 0) return result

    const commandName = commandParts[0]
    const command = commandName.toLowerCase()
    const args = commandParts.slice(1)

    if (command === 'ls') {
      let showAll = false
      let pathArg = null

      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('a')) {
            showAll = true
            continue
          }
          result.lines.push({
            type: 'error',
            text: `ls: invalid option -- '${arg.replace(/-/g, '')}'`,
          })
          return result
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
        result.lines.push({
          type: 'output',
          text: getBaseName(targetPath),
        })
        return result
      }

      const names = Object.keys(node.children)
        .filter((name) => showAll || !name.startsWith('.'))
        .sort((a, b) => a.localeCompare(b))

      const output = showAll ? ['.', '..', ...names].join('  ') : names.join('  ')
      result.lines.push({ type: 'output', text: output })
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
        text: 'Comandos: ls, cd, cat, mkdir, nano, pwd, help',
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

    setHistory((previous) => [
      ...previous,
      {
        type: 'command',
        path: executionPath,
        text: typedCommand,
      },
    ])

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

    appendHistoryLines(executionResult.lines)

    if (executionResult.nextPath !== null) {
      setCurrentPath(executionResult.nextPath)
    }

    if (executionResult.nextFileSystem) {
      setFileSystem(executionResult.nextFileSystem)
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
        statusMessage: '[ Read File is not implemented in this simulator ]',
      }))
      return
    }

    if (ctrlOrMeta && key === '\\') {
      event.preventDefault()
      withNanoSession((previous) => ({
        ...previous,
        statusMessage: '[ Replace is not implemented in this simulator ]',
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