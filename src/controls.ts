
export type ControlType = "Dummy" | "Keys" | "AI"
class Controls {
    forward = false
    left = false
    right = false
    reverse = false
    constructor(type: ControlType) {
        switch (type) {
            case "Dummy":
                this.forward = true
                break;
            case "Keys":
                this.addKeyboardListeners()
        }
    }
    private addKeyboardListeners() {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true
                    break
                case "ArrowRight":
                    this.right = true
                    break
                case "ArrowUp":
                    this.forward = true
                    break
                case "ArrowDown":
                    this.reverse = true
                    break
            }
        })

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false
                    break
                case "ArrowRight":
                    this.right = false
                    break
                case "ArrowUp":
                    this.forward = false
                    break
                case "ArrowDown":
                    this.reverse = false
                    break
            }
        })
    }
}


export default Controls