import Car from "./car";
import { NeuralNetwork } from "./network";
import Road from "./road";
import "./style.css"
import { getRandomColor } from "./utils";
import Visualizer from "./visualizer";


(() => {
    const canvas = document.querySelector("canvas")
    const networkCanvas = document.querySelector(".networkCanvas") as HTMLCanvasElement;
    const saveButton = document.getElementById("save")
    const discardButton = document.getElementById("discard")

    if (!canvas) return;
    if (!networkCanvas) return;
    canvas.width = 300
    canvas.height = window.innerHeight

    networkCanvas.width = 300
    networkCanvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    const networkCtx = networkCanvas.getContext('2d')


    const road = new Road(canvas.width / 2, canvas.width * 0.95)

    const generateCars = (N: number) => {
        const cars = []
        for (let i = 0; i <= N; i++) {
            cars.push(new Car(road.getLineCenter(1), 100, 50, 100, "AI", 4))
        }
        return cars
    }

    const N = 2000
    const cars = generateCars(N)

    const traffic = [
        new Car(road.getLineCenter(1), -100, 50, 100, "Dummy"),
        new Car(road.getLineCenter(0), -700, 50, 100, "Dummy"),
        new Car(road.getLineCenter(2), -900, 50, 100, "Dummy"),
        new Car(road.getLineCenter(2), -900, 50, 100, "Dummy"),
        new Car(road.getLineCenter(2), -900, 50, 100, "Dummy"),
        new Car(road.getLineCenter(2), -900, 50, 100, "Dummy"),
    ]

    let bestCar = cars[0]
    let bestBrain = localStorage.getItem("bestBrain")
    cars.forEach((car, i) => {
        if (bestBrain) {
            if (i == 0) {
                car.brain = JSON.parse(bestBrain);
            }
            else {
                if (car.brain) {
                    NeuralNetwork.mutate(car.brain, 0.2)
                }
            }
        }
    })

    const carsColors = [
        getRandomColor(),
        getRandomColor(),
        getRandomColor()
    ]

    const saveBestBrain = (bestCar: Car) => {
        localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain))
    }
    const discardBestBrain = () => {
        localStorage.removeItem("bestBrain")
    }

    const generateTraffic = (traffic: Car[]) => {
        const addNewCar = () => {
            if (traffic.length < 20) {
                traffic.push(
                    new Car(
                        road.getLineCenter(Math.floor(Math.random() * 3)), bestCar.y - 5000, 50, 100, "Dummy"
                    )
                )
            }
            traffic.filter(car => car.y > bestCar.y + 1000)
        }
        setInterval(addNewCar, 5000)
    }
    generateTraffic(traffic)

    function animate(time: number = 0) {
        if (!ctx) return;
        if (!networkCtx) return;
        if (!canvas) return
        const bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)));
        if (!bestCar) return;
        canvas.height = window.innerHeight;
        networkCanvas.height = window.innerHeight;
        ctx.save()
        ctx.globalAlpha = 0.2;
        ctx.translate(0, -bestCar.y + window?.innerHeight * 0.7)
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].update(road.borders, [])
        }
        cars.forEach(car => {
            car.update(road.borders, traffic)
        })
        cars.forEach(car => {
            car.draw(ctx, "black")
        })
        ctx.globalAlpha = 1;
        bestCar.draw(ctx, "blue", true)
        road.draw(ctx)
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(ctx, carsColors[i])
        }
        if (bestCar.brain) {
            Visualizer.drawNetwork(networkCtx, bestCar.brain)
        }
        networkCtx.setLineDash([time, time])
        ctx.restore()
        requestAnimationFrame(animate)
    }
    animate()


    saveButton?.addEventListener("click", () => {
        saveBestBrain(bestCar)
    })
    discardButton?.addEventListener("click", () => {
        discardBestBrain()
    })
})()
