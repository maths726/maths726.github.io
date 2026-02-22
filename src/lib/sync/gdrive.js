/**
 * Google Drive API wrapper for backup/restore functionality
 * Uses Google Identity Services for authentication
 * Stores backups in the hidden app data folder (drive.appdata scope)
 */

const BACKUP_FILENAME = 'suivi-client-backup.json'
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata email'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

let tokenClient = null
let accessToken = null
let gapiLoaded = false
let gisLoaded = false

/**
 * Load the Google API client library
 */
function loadGapiClient() {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC]
          })
          gapiLoaded = true
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
    script.onerror = () => reject(new Error('Failed to load GAPI'))
    document.head.appendChild(script)
  })
}

/**
 * Wait for Google Identity Services to be ready
 */
function waitForGis() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      gisLoaded = true
      resolve()
      return
    }

    // Poll for GIS availability (loaded via script in index.html)
    const checkGis = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        gisLoaded = true
        clearInterval(checkGis)
        resolve()
      }
    }, 100)

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkGis)
      resolve()
    }, 10000)
  })
}

/**
 * Initialize Google authentication
 * @param {string} clientId - OAuth 2.0 Client ID from Google Cloud Console
 * @returns {Promise<void>}
 */
export async function initGoogleAuth(clientId) {
  if (!clientId) {
    throw new Error('Client ID is required')
  }

  console.log('🔧 Initializing Google Auth...')
  console.log('📍 Current origin:', window.location.origin)
  console.log('📍 Full URL:', window.location.href)
  console.log('🔑 Client ID:', clientId)

  await Promise.all([loadGapiClient(), waitForGis()])

  console.log('✅ GAPI loaded:', gapiLoaded)
  console.log('✅ GIS loaded:', gisLoaded)

  if (!gisLoaded) {
    console.error('❌ Google Identity Services not available')
    throw new Error('Google Identity Services not available')
  }

  console.log('🔧 Creating token client...')

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {} // Will be set during signIn
  })

  console.log('✅ Token client created')

  // Check for existing token in localStorage
  const savedToken = localStorage.getItem('gdrive_access_token')
  const savedExpiry = localStorage.getItem('gdrive_token_expiry')

  if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry)) {
    console.log('✅ Found existing valid token')
    accessToken = savedToken
    window.gapi.client.setToken({ access_token: accessToken })
  } else {
    console.log('ℹ️ No existing token or token expired')
  }
}

/**
 * Sign in with Google and request Drive access
 * @returns {Promise<{email: string}>} User info
 */
export function signIn() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized. Call initGoogleAuth first.'))
      return
    }

    console.log('🔐 Starting sign in process...')

    tokenClient.callback = (response) => {
      console.log('📨 Received OAuth response')
      
      if (response.error) {
        console.error('❌ Token error:', response.error)
        reject(new Error(response.error))
        return
      }

      console.log('✅ Access token received')
      accessToken = response.access_token

      // Set token in GAPI client for Drive API calls
      window.gapi.client.setToken({ access_token: accessToken })

      // Save token with expiry (typically 1 hour)
      const expiryTime = Date.now() + (response.expires_in * 1000)
      localStorage.setItem('gdrive_access_token', accessToken)
      localStorage.setItem('gdrive_token_expiry', expiryTime.toString())

      console.log('📧 Fetching user info...')

      // Get user email
      fetchUserInfo()
        .then((userInfo) => {
          console.log('✅ User info received:', userInfo.email)
          localStorage.setItem('gdrive_user_email', userInfo.email)
          localStorage.setItem('gdrive_connected', 'true')
          resolve(userInfo)
        })
        .catch((error) => {
          console.error('❌ Failed to fetch user info:', error)
          reject(error)
        })
    }

    // Request access token - MUST be called synchronously in user action
    console.log('🚀 Requesting access token...')
    
    if (accessToken) {
      // Token exists, request a new one to refresh
      tokenClient.requestAccessToken({ prompt: '' })
    } else {
      // No token, show consent screen
      tokenClient.requestAccessToken({ prompt: 'consent' })
    }
  })
}

/**
 * Sign out and revoke access
 */
export function signOut() {
  if (accessToken) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Token revoked')
    })
  }

  accessToken = null
  localStorage.removeItem('gdrive_access_token')
  localStorage.removeItem('gdrive_token_expiry')
  localStorage.removeItem('gdrive_user_email')
  localStorage.removeItem('gdrive_connected')
  localStorage.removeItem('gdrive_last_sync')

  if (window.gapi?.client) {
    window.gapi.client.setToken(null)
  }
}

/**
 * Check if user is currently signed in
 * @returns {boolean}
 */
export function isSignedIn() {
  const savedExpiry = localStorage.getItem('gdrive_token_expiry')
  return localStorage.getItem('gdrive_connected') === 'true' &&
         savedExpiry &&
         Date.now() < parseInt(savedExpiry)
}

/**
 * Fetch user info from Google
 * @returns {Promise<{email: string}>}
 */
async function fetchUserInfo() {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return response.json()
}

/**
 * Find backup file in app data folder
 * @returns {Promise<{id: string, modifiedTime: string} | null>}
 */
async function findBackupFile() {
  try {
    const response = await window.gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'files(id, name, modifiedTime)',
      q: `name='${BACKUP_FILENAME}'`
    })

    const files = response.result.files
    return files && files.length > 0 ? files[0] : null
  } catch (error) {
    console.error('Error finding backup file:', error)
    return null
  }
}

/**
 * Upload backup data to Google Drive
 * @param {object} data - Data to backup (from exportAllData)
 * @returns {Promise<{id: string, modifiedTime: string}>}
 */
export async function uploadBackup(data) {
  if (!accessToken) {
    throw new Error('Not signed in')
  }

  const content = JSON.stringify(data, null, 2)

  // Check if file already exists
  const existingFile = await findBackupFile()

  let result
  if (existingFile) {
    // Update existing file using GAPI client
    const response = await window.gapi.client.request({
      path: `/upload/drive/v3/files/${existingFile.id}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      headers: { 'Content-Type': 'application/json' },
      body: content
    })
    result = response.result
  } else {
    // Create new file using multipart upload via GAPI
    const boundary = '-------314159265358979323846'
    const delimiter = '\r\n--' + boundary + '\r\n'
    const closeDelimiter = '\r\n--' + boundary + '--'

    const metadata = {
      name: BACKUP_FILENAME,
      parents: ['appDataFolder']
    }

    const multipartBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      closeDelimiter

    const response = await window.gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartBody
    })
    result = response.result
  }

  // Update last sync time
  const syncTime = new Date().toISOString()
  localStorage.setItem('gdrive_last_sync', syncTime)

  return {
    id: result.id,
    modifiedTime: result.modifiedTime || syncTime
  }
}

/**
 * Download backup data from Google Drive
 * @returns {Promise<object | null>} Backup data or null if not found
 */
export async function downloadBackup() {
  if (!accessToken) {
    throw new Error('Not signed in')
  }

  const file = await findBackupFile()
  if (!file) {
    return null
  }

  const response = await window.gapi.client.drive.files.get({
    fileId: file.id,
    alt: 'media'
  })

  // Response body is already parsed if JSON
  if (typeof response.body === 'string') {
    return JSON.parse(response.body)
  }
  return response.result
}

/**
 * Get information about the backup file
 * @returns {Promise<{exists: boolean, modifiedTime: string | null}>}
 */
export async function getBackupInfo() {
  if (!accessToken) {
    return { exists: false, modifiedTime: null }
  }

  const file = await findBackupFile()
  return {
    exists: !!file,
    modifiedTime: file?.modifiedTime || null
  }
}

/**
 * Refresh token if needed
 * @returns {Promise<boolean>} True if token is valid
 */
export async function refreshTokenIfNeeded() {
  const savedExpiry = localStorage.getItem('gdrive_token_expiry')

  if (!savedExpiry || Date.now() >= parseInt(savedExpiry)) {
    // Token expired, need to re-authenticate
    return false
  }

  // Ensure token is set in gapi client
  const savedToken = localStorage.getItem('gdrive_access_token')
  if (savedToken && window.gapi?.client) {
    accessToken = savedToken
    window.gapi.client.setToken({ access_token: accessToken })
  }

  return true
}