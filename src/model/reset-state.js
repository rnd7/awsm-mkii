import Channel from "./channel.js";
import resetChannel from "./reset-channel.js";
import Session from "./session.js";
import Voice from "./voice.js";

export default function resetState(session) {
    if (!session) return 
    session.state = Session.TRIGGER_PLAY
    session.channels.forEach(channel => {
        resetChannel(channel)
    });
}