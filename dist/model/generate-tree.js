export default function generateTree(session) {
    let h = 0
    let W = 0
    const sessionBranch = {type: "session", branches: [], span: 0, depth: 1}
    session.channels.forEach(channel => {
        const channelBranch = {type: "channel", branches: [], span: 0, depth: 1} 
        sessionBranch.branches.push(channelBranch)
        channel.voices.forEach(voice => {
            const voiceBranch = generateRecursiveOscillatorTree("voice", voice.oscillator)
            channelBranch.branches.push(voiceBranch)
            channelBranch.span += voiceBranch.span
            channelBranch.depth = Math.max(channelBranch.depth, voiceBranch.depth + 1)
        })
        channelBranch.span = Math.max(1, channelBranch.span)
        sessionBranch.span += channelBranch.span
        sessionBranch.depth = Math.max(sessionBranch.depth, channelBranch.depth + 1)
    }) 
    sessionBranch.span = Math.max(1, sessionBranch.span)
    return sessionBranch
}

function generateRecursiveOscillatorTree(type, oscillator) {
    const oscillatorBranch = {type, branches:[], span: 0, depth: 1}
    if (oscillator.am) oscillatorBranch.branches.push(generateRecursiveOscillatorTree("am", oscillator.am))
    if (oscillator.fm) oscillatorBranch.branches.push(generateRecursiveOscillatorTree("fm", oscillator.fm))
    if (oscillator.transpose) oscillatorBranch.branches.push(generateRecursiveOscillatorTree("transpose", oscillator.transpose))
    if (oscillator.em) oscillatorBranch.branches.push(generateRecursiveOscillatorTree("em", oscillator.em))
    if (oscillator.sx) oscillatorBranch.branches.push(generateRecursiveOscillatorTree("sx", oscillator.sx))
    if (oscillator.gain) oscillatorBranch.branches.push(generateRecursiveOscillatorTree("gain", oscillator.gain))
    oscillatorBranch.branches.forEach((branch)=>{
        oscillatorBranch.span += branch.span
        oscillatorBranch.depth = Math.max(oscillatorBranch.depth, branch.depth +1)
    })
    oscillatorBranch.span = Math.max(1, oscillatorBranch.span)

    return oscillatorBranch
}