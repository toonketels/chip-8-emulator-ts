import {Bit12, Bit8} from "./types";
import blessed from "blessed";
import {IOMM, IOMemoryMapper} from "./ioMemoryMapper";

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
    private keypressed: NodeJS.Timeout | undefined;
    private iomm: IOMM

    constructor(iomm: IOMM) {
        this.iomm = iomm
        this.screen = blessed.screen({smartCSR: true, width: IOMemoryMapper.SCREEN_WIDTH * 2, height: IOMemoryMapper.SCREEN_HEIGHT})

        this.initScreen()
        this.initKeyboard()
    }

    private initScreen(): void {
        this.screen.title = `CHIP 8`
        this.screen.fillRegion(this.bg, '█', 0, IOMemoryMapper.SCREEN_WIDTH * 2, 0, IOMemoryMapper.SCREEN_HEIGHT)
        
        this.iomm.onScreenUpdated(this.updateScreen.bind(this))
        this.iomm.onScreenCleared(this.clearScreen.bind(this))
    }

    private initKeyboard(): void {
        this.screen.on('keypress', this.handleKeypress.bind(this))
    }

    // @TODO better typing
    handleKeypress(_: any, key: {full: string}) {
        switch (key.full) {
            case 'q':
                process.exit()
                break
            case '0':
                this.keypress(0x00)
                break
            case '1':
                this.keypress(0x01)
                break
            case '2':
                this.keypress(0x02)
                break
            case '3':
                this.keypress(0x03)
                break
            case '4':
                this.keypress(0x04)
                break
            case '5':
                this.keypress(0x05)
                break
            case '6':
                this.keypress(0x06)
                break
            case '7':
                this.keypress(0x07)
                break
            case '8':
                this.keypress(0x08)
                break
            case '9':
                this.keypress(0x09)
                break
            case '0':
                this.keypress(0x0a)
                break
            case 'b':
                this.keypress(0x0b)
                break
            case 'c':
                this.keypress(0x0c)
                break
            case 'd':
                this.keypress(0x0d)
                break
            case 'e':
                this.keypress(0x0e)
                break
            case 'f':
                this.keypress(0x0f)
                break
        }
    }

    renderScreen(): void {
        this.screen.render()
    }

    updateScreen(screenBuffer: Uint8Array, address: Bit12, byte: Bit8): void {

        const BYTE = 8;
        let x = (address - IOMemoryMapper.SCREEN_BASE_ADDRESS) % IOMemoryMapper.SCREEN_WIDTH_IN_BYTES
        let y = Math.floor((address - IOMemoryMapper.SCREEN_BASE_ADDRESS) / IOMemoryMapper.SCREEN_WIDTH_IN_BYTES)

        for (let shift = 0; shift < BYTE; shift++) {
            let bit = (byte & (0b1 << shift)) >> shift
            let color = bit ? this.fg : this.bg
            let coorX = ((x * BYTE) + (BYTE - shift)) * 2
            let coorY = y
            this.screen.fillRegion(color, '█', coorX - 2, coorX, coorY, coorY + 1)
        }
    }

    clearScreen(): void {
        // this.screen.clearRegion(0, IOMemoryMapper.SCREEN_WIDTH * 2, 0, IOMemoryMapper.SCREEN_HEIGHT)
        this.screen.fillRegion(this.bg, '█', 0, IOMemoryMapper.SCREEN_WIDTH * 2, 0, IOMemoryMapper.SCREEN_HEIGHT)
    }

    keypress(key: number) {
        let iomm = this.iomm

        iomm.pressKey(key)


        if (this.keypressed !== undefined) clearTimeout(this.keypressed)
        this.keypressed = setTimeout(() => iomm.releaseKey(), 100)
    }


}