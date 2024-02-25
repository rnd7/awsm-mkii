import Voice from "./voice.js"

export default function resetVoice(voice) {
    if (
        voice.state === Voice.ATTACK
        || voice.state === Voice.SUSTAIN
        
    ) {
        voice.state = Voice.TRIGGER_ATTACK
    } else if (voice.state === Voice.TRIGGER_RELEASE || voice.state === Voice.RELEASE) {
        voice.state = Voice.IDLE
    }
}