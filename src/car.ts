import Controls, { ControlType } from "./controls";
import { NeuralNetwork } from "./network";
import { Border, Point } from "./road";
import Sensor from "./sensor";
import { polysIntesect } from "./utils";


class Car {
    private controls: Controls
    private speed = 0
    private acceleration = 0.2
    private maxSpeed = 10
    private friction = 0.05
    public angle = 0
    private sensor: Sensor | undefined
    public polygon: Point[] = []
    damaged = false
    brain: NeuralNetwork | undefined
    private useBrain: boolean
    constructor(public x: number, public y: number, private width: number, private height: number, controlType: ControlType, maxSpeed = 3) {
        this.maxSpeed = maxSpeed
        this.controls = new Controls(controlType)
        this.useBrain = controlType === "AI"
        if (controlType != "Dummy") {
            this.sensor = new Sensor(this)
            if (this.useBrain) {
                this.brain = new NeuralNetwork(
                    [this.sensor?.rayCount, 4]
                )
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D, color: string, drawSensor: boolean = false) {
        ctx.fillStyle = this.damaged ? "gray" : color
        if (this.polygon.length == 0) return
        ctx.beginPath()
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
        this.polygon.forEach(point => {
            ctx.lineTo(point.x, point.y)
        })
        ctx.fill()
        ctx.closePath()
        if (this.sensor && drawSensor)
            this.sensor.draw(ctx)
    }
    update(borders: Border[], traffic: Car[]) {
        if (!this.damaged) {
            this.move()
            this.polygon = this.createPoligon()
            this.damaged = this.assessDamage(borders, traffic)
        }
        if (this.sensor && this.brain) {
            this.sensor.update(borders, traffic)
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            if (this.useBrain) {
                this.controls.forward = !!outputs[0];
                this.controls.left = !!outputs[1];
                this.controls.right = !!outputs[2];
                this.controls.reverse = !!outputs[3];
            }
        }
    }
    private assessDamage(borders: Border[], traffic: Car[]) {
        for (let i = 0; i < borders.length; i++) {
            if (polysIntesect(this.polygon, borders[i])) {
                return true
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntesect(this.polygon, traffic[i].polygon)) {
                return true
            }
        }
        return false
    }
    private createPoligon() {
        const points: Point[] = []
        const rad = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        })
        return points
    }
    private move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration
        }
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1
            if (this.controls.left) {
                this.angle += 0.03 * flip
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip
            }
        }
        if (this.speed >= this.maxSpeed) {
            this.speed = this.maxSpeed
        }
        if (this.speed <= -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2
        }
        if (this.speed > 0) {
            this.speed -= this.friction
        }
        if (this.speed < 0) {
            this.speed += this.friction
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0
        }
        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }
}

export default Car