import generateUuidV4 from "./generate-uuid-v4.js"

export default function generateId() {
        // when crypto available
        if (typeof crypto !== "undefined") return crypto.randomUUID()
        // otherwise (Audio worklets seem to not support it)
        return generateUuidV4()
}