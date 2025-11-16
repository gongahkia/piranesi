// Piranesi etching filter mode utilities

export function enableEtchingMode() {
  document.documentElement.classList.add('etching-mode')
}

export function disableEtchingMode() {
  document.documentElement.classList.remove('etching-mode')
}

export function toggleEtchingMode() {
  document.documentElement.classList.toggle('etching-mode')
  return document.documentElement.classList.contains('etching-mode')
}

export function isEtchingModeActive(): boolean {
  return document.documentElement.classList.contains('etching-mode')
}
