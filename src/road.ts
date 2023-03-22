import { lerp } from "./utils";

export type Point = {
    x: number
    y: number
}

export type Border = [
    start: Point,
    end: Point 
]

class Road {
    private left;
    private right;
    private top;
    private bottom;
    public borders: Border[];

    constructor(private x: number, private width: number, private laneCount: number = 3) {
        this.left = this.x - this.width / 2
        this.right = this.x + this.width / 2
        const infinity = 99999;
        this.top = -infinity
        this.bottom = infinity


        const topLeft = {
            x: this.left,
            y: this.top
        }
        const topRight = {
            x: this.right,
            y: this.top
        }
        const bottomLeft = {
            x: this.left,
            y: this.bottom
        }
        const BottomRight = {
            x: this.right,
            y: this.bottom
        }

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, BottomRight],
        ]
    }
    getLineCenter(laneIndex: number) {
        const laneWidth = this.width / this.laneCount
        return this.left + laneWidth / 2 + laneWidth * Math.min(laneIndex, this.laneCount - 1)
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 5
        ctx.strokeStyle = "#FFF"
        for (let i = 1; i <= this.laneCount - 1; i++) {
            const x = lerp(
                this.left,
                this.right,
                i / this.laneCount
            )
            ctx.beginPath();
            ctx.setLineDash([20, 20])
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        ctx.setLineDash([])
        this.borders.forEach(border => {
            ctx.beginPath()
            ctx.moveTo(border[0].x, border[0].y)
            ctx.lineTo(border[1].x, border[1].y)
            ctx.stroke()
        })
    }
}

export default Road