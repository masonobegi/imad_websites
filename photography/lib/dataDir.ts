import fs from 'fs'
import path from 'path'

// DATA_DIR is set in Railway via environment variable pointing to the mounted Volume.
// In local dev (no DATA_DIR), falls back to public/ so nothing changes.
const DATA_DIR = process.env.DATA_DIR

export function getDataPath(relative: string): string {
  if (!DATA_DIR) {
    return path.join(process.cwd(), 'public', relative)
  }

  const volumePath = path.join(DATA_DIR, relative)

  // Lazy-seed: if this file doesn't exist on the volume yet, copy the default
  // from public/ (which is committed to git and always present in the container).
  if (!fs.existsSync(volumePath)) {
    const defaultPath = path.join(process.cwd(), 'public', relative)
    if (fs.existsSync(defaultPath)) {
      fs.mkdirSync(path.dirname(volumePath), { recursive: true })
      fs.copyFileSync(defaultPath, volumePath)
    }
  }

  return volumePath
}

// For directories: ensure they exist on the volume (no seeding needed).
export function getDataDir(relative: string): string {
  if (!DATA_DIR) {
    return path.join(process.cwd(), 'public', relative)
  }
  const volumeDir = path.join(DATA_DIR, relative)
  fs.mkdirSync(volumeDir, { recursive: true })
  return volumeDir
}
