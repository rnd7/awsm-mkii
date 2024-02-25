import randomWord from "./random-word.js"

function biasedRandomNumber(min, max, bias) {
    const baseRandom = Math.random();
    const biasedRandom = Math.pow(baseRandom, 1/bias);
    const range = max - min;
    const scaledRandom = Math.floor(biasedRandom * range) + min;
  
    return Math.min(Math.max(scaledRandom, min), max);
}

export default function randomName() {
    let name = ""
    const minChars = 5
    const maxChars = 13
    const minWordLength = 2
    const maxWordLength = 9
    const nameLen = biasedRandomNumber(minChars, maxChars, 2)
    // Math.round(minChars + Math.random() * (maxChars-minChars))
    while (name.length < nameLen) {
        if (name.length) name += " "
        let wordLen
        let available = (nameLen - name.length)
        wordLen = biasedRandomNumber(minWordLength, maxWordLength, 3) 
        if (available < minWordLength*2+1) {
            wordLen = available
        } else if (available > wordLen) {// Math.round(minWordLength + Math.random() * (maxWordLength-minWordLength))
            wordLen = Math.min(available - minWordLength - 1, wordLen )
        }
        const word = randomWord(wordLen)
        name += word
    }
    name = name.split(" ").sort(()=>{return (Math.random()>0.5)?-1:1}).join(" ")
    return name
}