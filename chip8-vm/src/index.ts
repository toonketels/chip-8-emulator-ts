import {VM} from "./vm";
import {DeviceIoManager} from "./ioManager";


export function createVM(ops: VMOps) {
    return new VM(ops)
}

export interface VMOps {
    rom: string
    createIoDevice: (iomm: IOOps) => IO
}

export interface IO {
    updatePixel(x: number, y: number, isOn: boolean): void
    renderScreen(): void
    clearScreen(): void
}

export interface IOOps {
    screenWidth: number
    screenHeight: number
    iom: DeviceIoManager
}

