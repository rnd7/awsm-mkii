import TArray from "./t-array.js"
import TBoolean from "./t-boolean.js"
import TObject from "./t-object.js"
import TNumber from "./t-number.js"
import TInstance from "./t-instance.js"
import TString from "./t-string.js"

const typeMap = new Map([
    [String, TString],
    [Number, TNumber],
    [Boolean, TBoolean]
])

export function T(type, value) {
    if (typeMap.has(type)){
        return new (typeMap.get(type))(value)
    }
    return new TInstance(value, type)
}

export function A(type, value) {
    if (!Array.isArray(value)) value = []
    return new TArray(value, type)
}

export function O(type, value) {
    if (typeof value !== 'object') value = {}
    return new TObject(value, type)
}