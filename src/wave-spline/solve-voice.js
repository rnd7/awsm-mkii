import solveOscilator from "./solve-oscillator.js"

export default function solveVoice(sampleRate, voice) {
    return solveOscilator(sampleRate, voice.oscillator)
}

