import Car from "./car";
import { Border } from "./road";
import { getIntersection, lerp } from "./utils";

type Point = {
    x: number,
    y: number
}
type TouchPoint = {
    offset: number
} & Point

type Ray = [
    start: Point,
    end: Point
]

class Sensor {
    rayCount: number
    private rayLength
    private raySpread
    private rays: Ray[]
    readings: (TouchPoint | null | undefined)[] = []
    constructor(private car: Car) {
        this.rayCount = 10
        this.rayLength = 300
        this.raySpread = Math.PI / 2
        this.rays = []
    }
    update(roadBorder: Border[], traffic: Car[]) {
        this.castRays()
        this.readings = []
        this.rays.forEach(ray => {
            const reading = this.getReading(ray, roadBorder, traffic)
            this.readings.push(
                reading
            )
        })
    }

    private getReading(ray: Ray, roadBorder: Border[], traffic: Car[]) {
        let touches: TouchPoint[] = []
        roadBorder.forEach(border => {
            const touch = getIntersection(
                ray[0],
                ray[1],
                border[0],
                border[1]
            )
            if (touch) {
                touches.push(touch)
            }
        })
        traffic.forEach(c => {
            const polygon = c.polygon
            for(let i = 0; i< polygon.length; i++){
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    polygon[i],
                    polygon[(i+1) % polygon.length]
                )
                if(touch){
                    touches.push(touch)
                }
            }
        })
        if (touches.length === 0) {
            return null
        } else {
            const offsets = touches.map(e => e.offset)
            const minOffset = Math.min(...offsets)
            return touches.find(e => e.offset == minOffset)
        }
    }
    private castRays() {
        this.rays = []
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;
            const start = {
                x: this.car.x,
                y: this.car.y
            }
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            }
            this.rays.push([start, end])        
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        if(this.rays.length == 0) return
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1]
            if (this.readings[i]) {
                end = this.readings[i] as Point
            }
            ctx.beginPath()
            ctx.strokeStyle = "yellow"
            ctx.lineWidth = 2
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.lineWidth = 2
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

        }
    }
}

export default Sensor