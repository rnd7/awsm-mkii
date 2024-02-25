
import Component from "./component.js"
export default class DatabaseSessionItem extends Component {

    static style = 'component/database-session-item.css'
    static UP = 'up'
    static DOWN = 'down'
    #tree
    #name = ""
    #id = ""
    #changed = ""
    #active = false
    #isDown
    #canvas = document.createElement("canvas")
    #ctx
    #container = document.createElement("div")
    #nameElement = document.createElement("div")
    #idElement = document.createElement("div")
    #dateElement = document.createElement("div")
    #channelsElement = document.createElement("div")
    #voicesElement = document.createElement("div")

    constructor() {
        super()
        this.intitialized = false
        this.#canvas.setAttribute("draggable", false)
        this.#canvas.setAttribute("width", 180)
        this.#canvas.setAttribute("height", 72)

    
        this.#ctx = this.#canvas.getContext("2d")
        this.shadowRoot.append(this.#canvas)

        this.#container.classList.add("container")
        this.shadowRoot.append(this.#container)

        this.#nameElement.classList.add("name")
        this.#container.append(this.#nameElement)

        this.#idElement.classList.add("id")
        this.#container.append(this.#idElement)

        this.#dateElement.classList.add("date")
        this.#container.append(this.#dateElement)

        this.#channelsElement.classList.add("channels")
        this.#container.append(this.#channelsElement)

        //this.#voicesElement.classList.add("channels")
        //this.#container.append(this.#voicesElement)

        this.#init()
    }
    async #init() {
        await this.appendStyleLink(DatabaseSessionItem.style)
        this.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.intitialized = true
    }

    #onPointerDown(e) {
        if (this.#isDown) return 
        this.#isDown = e.pointerId
        this.setPointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                DatabaseSessionItem.DOWN, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
        
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                DatabaseSessionItem.UP, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }

    set active(value) {
        this.#active = value
        this.addToRenderQueue(this.binding(this.#render))
        this.addToRenderQueue(this.binding(this.#renderTree))
    }

    get active() {
        return this.#active
    }
    
    set id(value) {
        this.#id = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get id() {
        return this.#id
    }


    set name(value) {
        this.#name = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get name() {
        return this.#name
    }


    set changed(value) {
        this.#changed = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get changed() {
        return this.#changed
    }

    set tree(value) {
        if (JSON.stringify(this.#tree) === JSON.stringify(value)) return
        this.#tree = value
        this.addToRenderQueue(this.binding(this.#renderTree))
    }
 
    get tree() {
        return this.#tree
    }

    #render() {
        if (this.#active) this.classList.add("active")
        else this.classList.remove("active")
        this.#nameElement.textContent = this.#name
        this.#idElement.textContent = this.#id
        this.#dateElement.textContent = new Date(this.#changed).toISOString().replace('T', ' ').slice(0, -5)

        let voices = 0
        this.#tree.branches.forEach(channel => {voices += channel.branches.length})
        this.#channelsElement.textContent = `${this.#tree.branches.length} Channels, ${voices} Voices`
        //this.#voicesElement.textContent = `${voices} Voices`
    }

    #lineWidth =  4
    #branchDepth = 0
    #branchSpan = 0
    #padding = 6



    #renderRecursive(x, y, branch, lineWidth=2) {
        let sx = x-(branch.span * this.#branchSpan)/2
        this.#ctx.save()
        const col = (this.#active)?"#000000":"#909090"
        this.#ctx.strokeStyle = col
        this.#ctx.lineWidth = lineWidth
        this.#ctx.lineCap = "square"
        for (let i = 0; i<branch.branches.length; i++){
     
            let hy = y+this.#branchDepth/2
            let hx = x
            const sy = y + this.#branchDepth
            sx += (branch.branches[i].span/2)*this.#branchSpan
            this.#ctx.save()
            this.#ctx.strokeStyle = col
            this.#ctx.lineWidth = lineWidth
            this.#ctx.lineCap = "square"
            this.#ctx.beginPath()
            this.#ctx.moveTo(x, y)

            this.#ctx.lineTo(hx, hy)
            this.#ctx.lineTo(sx, hy)
            this.#ctx.lineTo(sx, sy)
            this.#ctx.stroke()
            this.#ctx.restore()
            //sy += (branch.branches[i].span / 2)*this.#branchHeight
            this.#renderRecursive(sx, sy, branch.branches[i], Math.max(2,lineWidth-1))
            sx += (branch.branches[i].span/2)*this.#branchSpan

        }
    }
    /*

    #renderRecursive(x, y, branch, lineWidth=3) {
        let sy = y-(branch.span * this.#branchSpan)/2
        this.#ctx.save()
        const col = (this.#active)?0x0:0xFF
        this.#ctx.strokeStyle = `rgb(${col},${col},${col})`
        this.#ctx.lineWidth = lineWidth
        this.#ctx.lineCap = "square"
        for (let i = 0; i<branch.branches.length; i++){
     
            let hx = x+this.#branchDepth/2
            let hy = y
            const sx = x + this.#branchDepth
            sy += (branch.branches[i].span/2)*this.#branchSpan
            this.#ctx.save()
            this.#ctx.strokeStyle = `rgb(${col},${col},${col})`
            this.#ctx.lineWidth = lineWidth
            this.#ctx.lineCap = "square"
            this.#ctx.beginPath()
            this.#ctx.moveTo(x, y)

            this.#ctx.lineTo(hx, hy)
            this.#ctx.lineTo(hx, sy)
            this.#ctx.lineTo(sx, sy)
            this.#ctx.stroke()
            this.#ctx.restore()
            //sy += (branch.branches[i].span / 2)*this.#branchHeight
            this.#renderRecursive(sx, sy, branch.branches[i], Math.max(2,lineWidth-1))
            sy += (branch.branches[i].span/2)*this.#branchSpan

        }
    }

    */

    #renderTree() {
        let w = this.#canvas.width - 2 * this.#padding
        let h = this.#canvas.height - 4 * this.#padding
        this.#branchDepth = h/(this.#tree.depth-1) // leaves only drawn half width
        this.#branchSpan = w/this.#tree.span
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
        let x = w/2 + this.#padding
        let y = 0 + 2 * this.#padding
        this.#renderRecursive(x, y, this.#tree)

    }

    destroy() {
        super.destroy()
    }

}