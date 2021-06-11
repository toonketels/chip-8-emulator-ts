import EventEmitter from "events";
import {Bit12, Bit8} from "./types";
import {IO, IOOps} from "./io";

export interface DeviceIoManager {
    pressKey(key: Bit8): void
    releaseKey(): void
}

export interface VmIoManager {
    renderScreen(): void;
}

export interface CpuIoManager {
    clearScreen(): void;
    draw(x: number, y: number, spriteAddress: Bit12, spriteHeight: Bit8): boolean;
    isKeyPressed(): boolean;
    getPressedKey(): Bit8 | undefined;
    isKeyWithValuePressed(value: Bit8): boolean;
}

export class IoManager implements DeviceIoManager, CpuIoManager, VmIoManager {

    static SCREEN_BASE_ADDRESS = 0x050
    static SCREEN_WIDTH = 64
    static SCREEN_WIDTH_IN_BYTES = IoManager.SCREEN_WIDTH / 8
    static SCREEN_HEIGHT = 32
    static SCREEN_SIZE = IoManager.SCREEN_WIDTH * IoManager.SCREEN_HEIGHT / 8
    static KEY_PRESSED = 0x150
    static KEY_VALUE = 0x151

    private readonly events = new EventEmitter()
    private readonly io: IO

    constructor(private memory: Uint8Array, createIO: (ops: IOOps) => IO) {
        this.io = createIO({
            screenWidth: IoManager.SCREEN_WIDTH,
            screenHeight: IoManager.SCREEN_HEIGHT,
            iom: this
        })

        this.events.on("SCREEN_CLEARED", this.io.clearScreen.bind(this.io))
        this.events.on("SCREEN_PIXEL_UPDATED", this.io.updatePixel.bind(this.io))
    }


    clearScreen(): void {
        let screenBegin = IoManager.SCREEN_BASE_ADDRESS
        let screenEnd = IoManager.SCREEN_BASE_ADDRESS + IoManager.SCREEN_SIZE

        // flip bits off
        for (let i = screenBegin; i < screenEnd; i++)
            this.memory[i] = 0x00

        this.events.emit("SCREEN_CLEARED")
    }

    // @TODO smarter update of pixels, only update the dirty pixels
    updateScreen(address: Bit12, byte: Bit8): void {

        const BYTE = 8;
        let x = (address - IoManager.SCREEN_BASE_ADDRESS) % IoManager.SCREEN_WIDTH_IN_BYTES
        let y = Math.floor((address - IoManager.SCREEN_BASE_ADDRESS) / IoManager.SCREEN_WIDTH_IN_BYTES)

        for (let shift = 0; shift < BYTE; shift++) {
            let isOn = ((byte & (0b1 << shift)) >> shift)!!
            let coorX = ((x * BYTE) + (BYTE - shift)) - 1
            let coorY = y
            this.events.emit("SCREEN_PIXEL_UPDATED", coorX, coorY, isOn)
        }


    }


    draw(x: number, y: number, spriteAddress: Bit12, spriteHeight: Bit8): boolean {

        const BYTE_SIZE = 8
        let pixelsErased = false

        if (x === undefined || y === undefined) throw new Error(`CPU exec draw no coordinate ${x} ${y}`)

        let isAligned = x % BYTE_SIZE === 0

        // If not aligned: write 2 bytes padded with zeros
        // Ex:
        //     |10011001|        | => with 3 bits padded on the left
        //     |   10011|001     |

        let paddingLeft = x % BYTE_SIZE
        let paddingRight = BYTE_SIZE - paddingLeft

        let offset = IoManager.SCREEN_BASE_ADDRESS + (IoManager.SCREEN_WIDTH_IN_BYTES * y) + Math.floor(x / BYTE_SIZE)
        for (let n = 0; n < spriteHeight; n++) {

            let toWrite = this.memory[spriteAddress + n]
            let toWriteMSB = toWrite >> paddingLeft              // if aligned: MSB === toWrite
            let toWriteLSB = isAligned ? 0x00 : (toWrite << paddingRight) & 0xff

            let addressMSB = offset + (IoManager.SCREEN_WIDTH_IN_BYTES * n);

            // adjust for vertical wrapping
            let needsToWrap = y + n >= IoManager.SCREEN_HEIGHT
            if (needsToWrap) {
                let nWrapped = (y + n) % IoManager.SCREEN_HEIGHT
                addressMSB = IoManager.SCREEN_BASE_ADDRESS + (IoManager.SCREEN_WIDTH_IN_BYTES * nWrapped) + Math.floor(x / BYTE_SIZE)
            }

            {
                let read = this.memory[addressMSB]
                let toWrite = read ^ toWriteMSB
                this.memory[addressMSB] = toWrite


                this.updateScreen(addressMSB, toWrite)

                // check if we erased a pixel
                // since XOR is stricter than OR, if they are not the same,
                // it means we erased at least one pixel
                pixelsErased = pixelsErased || (toWrite !== (read | toWriteMSB))
            }

            if (!isAligned) {
                let addressLSB = addressMSB + 1;

                // correct for horizontal wrapping
                let needsToWrap = addressLSB % IoManager.SCREEN_WIDTH_IN_BYTES === 0
                addressLSB = needsToWrap ? addressLSB - IoManager.SCREEN_WIDTH_IN_BYTES : addressLSB

                let read = this.memory[addressLSB];
                let toWrite = read ^ toWriteLSB
                this.memory[addressLSB] = toWrite

                this.updateScreen(addressLSB, toWrite)


                // check if we erased a pixel
                pixelsErased = pixelsErased || (toWrite !== (read | toWriteLSB))
            }
        }

        return pixelsErased
    }

    isKeyPressed(): boolean {
        return this.memory[IoManager.KEY_PRESSED] === 0xff;
    }

    getPressedKey(): Bit8 | undefined {
        return this.isKeyPressed() ? this.memory[IoManager.KEY_VALUE] : undefined;
    }

    isKeyWithValuePressed(value: number): boolean {
        return this.memory[IoManager.KEY_PRESSED] === 0xff && this.memory[IoManager.KEY_VALUE] === value

    }

    pressKey(key: Bit8): void {
        this.memory[IoManager.KEY_VALUE] = key
        this.memory[IoManager.KEY_PRESSED] = 0xff
    }

    releaseKey(): void {
        this.memory[IoManager.KEY_PRESSED] = 0x00
    }

    renderScreen(): void {
        this.io.renderScreen()
    }
}