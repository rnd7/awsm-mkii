export default function generateUuidV4() {
    return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => {  
        const r = Math.floor(Math.random() * 16)
        return r.toString(16)
    });  
}