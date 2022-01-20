import blessed from "blessed";
import {IO, IOOps} from "chip8-vm";


export class TerminalIO implements IO {

    private screen: blessed.Widgets.Screen
    // @ts-ignore
    private bg = blessed.helpers.attrToBinary({fg: 'blue'})
    // @ts-ignore
    private fg = blessed.helpers.attrToBinary({fg: 'red'})
    private keyPressed: NodeJS.Timeout | undefined;
    private ops: IOOps

    constructor(ops: IOOps) {
        this.ops = ops
        this.screen = blessed.screen({smartCSR: true, width: ops.screenWidth * 2, height: ops.screenHeight})

        this.initScreen()
        this.initKeyboard()
    }

    private initScreen(): void {
        this.screen.title = `CHIP 8`
        this.screen.fillRegion(this.bg, '█', 0, this.ops.screenWidth * 2, 0, this.ops.screenHeight)
    }

    private initKeyboard(): void {
        this.screen.on('keypress', this.handleKeypress.bind(this))
    }

    // @TODO better typing
    handleKeypress(_: any, key: {full: string}) {
        switch (key.full) {
            case 'escape':
                process.exit()
                break
            case 'x':
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
            case 'q':
                this.keypress(0x04)
                break
            case 'w':
                this.keypress(0x05)
                break
            case 'e':
                this.keypress(0x06)
                break
            case 'a':
                this.keypress(0x07)
                break
            case 's':
                this.keypress(0x08)
                break
            case 'd':
                this.keypress(0x09)
                break
            case 'z':
                this.keypress(0x0a)
                break
            case 'c':
                this.keypress(0x0b)
                break
            case '4':
                this.keypress(0x0c)
                break
            case 'r':
                this.keypress(0x0d)
                break
            case 'f':
                this.keypress(0x0e)
                break
            case 'v':
                this.keypress(0x0f)
                break
        }
    }

    renderScreen(): void {
        this.screen.render()
    }

    updatePixel(x: number, y: number, isOn: boolean) {
        let color = isOn ? this.fg : this.bg
        this.screen.fillRegion(color, '█', x * 2, x * 2 + 2, y, y + 1)

    }

    clearScreen(): void {
        this.screen.fillRegion(this.bg, '█', 0, this.ops.screenWidth * 2, 0, this.ops.screenHeight)
    }

    keypress(key: number) {
        let { pressKey, releaseKey } = this.ops.iom

       pressKey.apply(this.ops.iom, [key])

        if (this.keyPressed !== undefined) clearTimeout(this.keyPressed)
        this.keyPressed = setTimeout(() => releaseKey.apply(this.ops.iom), 100)
    }


}