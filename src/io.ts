import {Bit12, Bit8} from "./types";
import blessed from "blessed";
import {CPU} from "./cpu";

export interface IO {
    // @TODO better interface
    updateScreen(screenBuffer: Uint8Array, address: Bit12, byte: Bit8): void

    renderScreen(): void
}

export class TerminalIO implements IO {

    private screen: blessed.Widgets.Screen
    // @ts-ignore
    private bg = blessed.helpers.attrToBinary({fg: 'blue'})
    // @ts-ignore
    private fg = blessed.helpers.attrToBinary({fg: 'red'})
    private cpu: CPU

    constructor(cpu: CPU) {
        this.cpu = cpu
        this.screen = blessed.screen({smartCSR: true, width: CPU.SCREEN_WIDTH * 2, height: CPU.SCREEN_HEIGHT})


        this.initScreen()
        this.initKeyboard()
    }

    private initScreen(): void {
        this.screen.title = `CHIP 8`
        this.screen.fillRegion(this.bg, '█', 0, CPU.SCREEN_WIDTH * 2, 0, CPU.SCREEN_HEIGHT)

        this.cpu.emitter.on("screenUpdated", function (addr: Bit12, byte: Bit8) { // @ts-ignore
            this.updateScreen(this.cpu.memory, addr, byte)
        }.bind(this))

        this.cpu.emitter.on("screenCleared", this.clearScreen.bind(this))
    }

    private initKeyboard(): void {
        let vm = this
        this.screen.on('keypress', (_, key) => {
            switch (key.full) {
                case 'q':
                    process.exit()
                    break
                case '0':
                    vm.keypress(0x00)
                    break
                case '1':
                    vm.keypress(0x01)
                    break
                case '2':
                    vm.keypress(0x02)
                    break
                case '3':
                    vm.keypress(0x03)
                    break
                case '4':
                    vm.keypress(0x04)
                    break
                case '5':
                    vm.keypress(0x05)
                    break
                case '6':
                    vm.keypress(0x06)
                    break
                case '7':
                    vm.keypress(0x07)
                    break
                case '8':
                    vm.keypress(0x08)
                    break
                case '9':
                    vm.keypress(0x09)
                    break
                case '0':
                    vm.keypress(0x0a)
                    break
                case 'b':
                    vm.keypress(0x0b)
                    break
                case 'c':
                    vm.keypress(0x0c)
                    break
                case 'd':
                    vm.keypress(0x0d)
                    break
                case 'e':
                    vm.keypress(0x0e)
                    break
                case 'f':
                    vm.keypress(0x0f)
                    break
            }
        })
    }

    renderScreen(): void {
        this.screen.render()
    }

    updateScreen(screenBuffer: Uint8Array, address: Bit12, byte: Bit8): void {

        const BYTE = 8;
        let x = (address - CPU.SCREEN_BASE_ADDRESS) % CPU.SCREEN_WIDTH_IN_BYTES
        let y = Math.floor((address - CPU.SCREEN_BASE_ADDRESS) / CPU.SCREEN_WIDTH_IN_BYTES)

        for (let shift = 0; shift < BYTE; shift++) {
            let bit = (byte & (0b1 << shift)) >> shift
            let color = bit ? this.fg : this.bg
            // @TODO better naming
            let xx = (x * BYTE) + (BYTE - shift)
            let coorX = xx * 2
            let coorY = y
            this.screen.fillRegion(color, '█', coorX, coorX + 2, coorY, coorY + 1)
        }
    }

    clearScreen(): void {
        // this.screen.clearRegion(0, CPU.SCREEN_WIDTH * 2, 0, CPU.SCREEN_HEIGHT)
        this.screen.fillRegion(this.bg, '█', 0, CPU.SCREEN_WIDTH * 2, 0, CPU.SCREEN_HEIGHT)
    }

    keypress(key: number) {
        this.cpu.memory[CPU.KEY_VALUE] = key
        this.cpu.memory[CPU.KEY_PRESSED] = 0xff
    }


}