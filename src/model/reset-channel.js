import Channel from "./channel.js"
import resetVoice from "./reset-voice.js"

export default function resetChannel(channel) {
    channel.state = Channel.ACTIVE
    channel.voices.forEach(voice=>{
        resetVoice(voice)
    })
}