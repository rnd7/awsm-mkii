import ensureType from "./ensure-type.js";

export default function ensureTypes(type, array) {
    return array.map(element => ensureType(type, element))
}