import clone from "../data/clone.js"
import Signal from "../glue/signal.js"
import generateTree from "../model/generate-tree.js"

export default class DB {

    #db
    #name
    #version
    
    constructor(name, version) {
        this.#name = name
        this.#version = version
    }

    open() {
        return new Promise((resolve, reject)=>{
            const openRequest = indexedDB.open(this.#name, this.#version)
            openRequest.onerror = (event) => {
                reject('Error loading database.')
            }
            openRequest.onupgradeneeded = (event) => {
                const db = event.target.result
                const objectStore = db.createObjectStore("sessions", { keyPath: "id" })
                objectStore.createIndex("name", "name", { unique: false })
                objectStore.createIndex("changed", "changed", { unique: false })
                objectStore.createIndex("created", "created", { unique: false })
            }
            openRequest.onsuccess = (event) => {
                this.#db = openRequest.result
                resolve(openRequest.result)
            }
        })
    }

    write(session) {
        return new Promise((resolve, reject)=> {
            const tx = this.#db.transaction(['sessions'], "readwrite")
            const store = tx.objectStore("sessions")
            const sessionObject = clone(session)
            sessionObject.tree = generateTree(session)
            sessionObject.changed = Date.now()
            if (!sessionObject.created) sessionObject.created = Date.now()
            store.put(sessionObject)
            tx.oncomplete = () => {
                resolve()
                Signal.broadcast(this, {property: "sessions"})
            }
            tx.onerror = () => {
                reject(tx.error)
            }
        })
    }

    read(id) {
        return new Promise((resolve, reject)=>{
            const tx = this.#db.transaction(['sessions'], 'readwrite')
            const store = tx.objectStore('sessions');
            const query = store.get(id)
            query.onsuccess = () => {
                resolve(query.result)
            }
            query.onerror = () => {
                reject(tx.error)
            }
        
        })
    }

    list() {
        return new Promise((resolve, reject)=>{
            const tx = this.#db.transaction(['sessions'], 'readwrite')
            const store = tx.objectStore('sessions')
            const index = store.index('created')
            const cursor = index.openCursor(null, 'prev')
            const result = []
            cursor.onsuccess = (event) => {
                const currentCursor = event.target.result;
                if (!currentCursor) return resolve(result)
                const { id, name, tree, changed } = currentCursor.value
                result.push({id, name, tree, changed})
                currentCursor.continue()
            }

            cursor.onerror = (event) => {
                reject()
            }
        
        })
    }

    delete(id) {
        return new Promise((resolve, reject)=>{
            const tx = this.#db.transaction(['sessions'], 'readwrite')
            const store = tx.objectStore('sessions');
            const request = store.delete(id)
            tx.oncomplete = () => {
                resolve()
                Signal.broadcast(this, {property: "sessions"})
            }
            tx.onerror = () => {
                reject(tx.error)
            }
        
        })
    }

    recent() {
    
        return new Promise((resolve, reject)=>{
            const tx = this.#db.transaction(['sessions'], 'readwrite')
            const store = tx.objectStore('sessions')
            const index = store.index('changed')
            const cursor = index.openCursor(null, 'prev')

            cursor.onsuccess = (event) => {
                const currentCursor = event.target.result
                if (currentCursor) resolve(currentCursor.value)
                else resolve()
            }

            cursor.onerror = (event) => {
                reject()
            }

        })
    }

    close() {
        this.#db.close()
    }

}