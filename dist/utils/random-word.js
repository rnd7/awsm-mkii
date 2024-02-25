import randomPick from "./random-pick.js";

const syllableType = {
    "vowel":["ai", "ay", "ei", "ey", "oi", "oy", "ou", "au", "ea", "ee", "ie", "oo", "ue", "ui", "eu", "oa", "eo", "iu", "ae", "ui", "ie", "uo", "ey", "a", "e", "i", "o", "u", "y"],
    "consonant": ["str", "scr", "sch", "spr", "spl", "thr", "shr", "squ", "sm", "sn", "sp", "st", "sk", "sl", "sw", "bl", "cl", "fl", "gl", "pl", "tl", "br", "cr", "dr", "fr", "gr", "pr", "tr", "ch", "sh", "th", "wh", "kn", "gn", "b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","x","z"],
}

export default function randomWord(chars) {
    let word = ""; 
    let lastType
    
    while (word.length < chars) {
        let type
        if (word.length == 0) {
            type = randomPick(["vowel", "consonant"])
        } else if (lastType === "consonant") {
            type = "vowel"
        } else if (lastType === "vowel") {
            type = "consonant"
        } else {
            type = "vowel"
        }
        
        let available = chars-word.length
        let maxSyllableLength = available
        if (type === "consonant" && available == 3) maxSyllableLength = 2
        else if (type === "consonant" && available == 2) maxSyllableLength = 1
        const syllable = randomPick(
            syllableType[type].filter((syllable)=>{
                return syllable.length <= maxSyllableLength
            })
        )
        word += syllable
        lastType = type
    }
    word = word.charAt(0).toUpperCase() + word.slice(1)
    return word
}