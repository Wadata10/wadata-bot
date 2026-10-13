const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('WADATA BOT CONNECTED!')
    }
  })
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return
    if (msg.key.fromMe) return
    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    if (text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello') {
      await sock.sendMessage(from, { text: '👋 Hello! I am WADATA BOT! Type *menu*' })
    }
    if (text.toLowerCase() === 'menu') {
      await sock.sendMessage(from, { text: '*WADATA BOT MENU*\n\n1. hi\n2. menu\n3. ping' })
    }
    if (text.toLowerCase() === 'ping') {
      await sock.sendMessage(from, { text: 'Pong! 🏓' })
    }
  })
}
startBot()
