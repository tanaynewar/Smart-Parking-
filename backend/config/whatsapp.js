import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const sendWhatsAppMessage = async (phone, message) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:+91998365770`
        })
        console.log(`[WhatsApp] Sent to ${phone}, SID: ${result.sid}`)
        return result
    } catch (err) {
        console.error(`[WhatsApp] Failed to send to ${phone}:`, err.message)
    }
}