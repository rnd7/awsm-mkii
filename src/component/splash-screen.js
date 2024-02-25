import Component from "./component.js"
import SplashScreenAnimation from "./splash-screen-animation.js"
import SplashScreenItem from "./splash-screen-item.js"

export default class SplashScreen extends Component {

    static DISMISS = "dismiss"
    static style = 'component/splash-screen.css'

    #container = document.createElement("div")
    #info = SplashScreenItem.create()
    #logo = SplashScreenAnimation.create()

    constructor() {
        super()
        this.intitialized = false

        this.#container.classList.add("container")
        this.shadowRoot.append(this.#container)

        this.#logo.header = ""
        this.#logo.label = "AWSM"
        this.#logo.footer = ""
        this.#logo.mode = "icon"
        this.#container.append(this.#logo)
        
        this.#info.label = "AwesomeWaveSplineMachine MKII\n\nTo continue, you must agree that your browser's database is used to persist your sessions. All your actions will be saved automatically.\n\nBe careful, this software is theoretically capable of destroying your precious speakers.\n\nUse on your own risk!"
        this.#info.footer = "Click to agree and continue"
        this.#info.mode = "logo"
        this.#container.append(this.#info)


        this.#info.addEventListener(SplashScreenItem.UP, this.binding(this.#onPointerUp))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(SplashScreen.style)
        this.intitialized = true
    }

    #onPointerUp(e) {
        this.dispatchEvent(
            new CustomEvent(
                SplashScreen.DISMISS, 
                {
                    bubbles: true,
                    composed: true
                }
            )
        )
    }

    destroy() {
        super.destroy()

    }
}