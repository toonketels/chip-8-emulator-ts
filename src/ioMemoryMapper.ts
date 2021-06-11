import EventEmitter from "events";
import {Bit12, Bit8} from "./types";

export interface IOMM {
    events: EventEmitter

    clearScreen(): void;

    updateScreen(address: Bit12, toWrite: Bit8): void;

    draw(x: number, y: number, spriteAddress: Bit12, spriteHeight: Bit8): boolean;

    isKeyPressed(): boolean;

    getPressedKey(): Bit8 | undefined;

    isKeyWithValuePressed(value: Bit8): boolean;

    pressKey(key: Bit8): void;

    releaseKey(): void;

    onScreenUpdated(exec: OmitThisParameter<(screenBuffer: Uint8Array, address: Bit12, byte: Bit8) => void>): void;

    onScreenCleared(exec: OmitThisParameter<() => void>): void;
}

export class IOMemoryMapper implements IOMM {

    static SCREEN_BASE_ADDRESS = 0x050
    static SCREEN_WIDTH = 64
    static SCREEN_WIDTH_IN_BYTES = IOMemoryMapper.SCREEN_WIDTH / 8
    static SCREEN_HEIGHT = 32
    static SCREEN_SIZE = IOMemoryMapper.SCREEN_WIDTH * IOMemoryMapper.SCREEN_HEIGHT / 8
    static KEY_PRESSED = 0x150
    static KEY_VALUE = 0x151
    
    public events = new EventEmitter()

    constructor(private memory: Uint8Array) {
    }

    onScreenUpdated(exec: (screenBuffer: Uint8Array, address: number, byte: number) => void): void {
        let self = this
        this.events.on("SCREEN_UPDATED", function (addr: Bit12, byte: Bit8) { // @ts-ignore
            exec(self, addr, byte)
        })
    }

    onScreenCleared(exec: () => void): void {
            this.events.on("SCREEN_CLEARED", exec)
    }

    clearScreen(): void {
        let screenBegin = IOMemoryMapper.SCREEN_BASE_ADDRESS
        let screenEnd = IOMemoryMapper.SCREEN_BASE_ADDRESS + IOMemoryMapper.SCREEN_SIZE

        // flip app bits off
        for (let i = screenBegin; i < screenEnd; i++)
            this.memory[i] = 0x00

        this.events.emit("SCREEN_CLEARED")
    }

    updateScreen(address: Bit12, toWrite: Bit8): void {
        this.events.emit("SCREEN_UPDATED", address, toWrite)
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

        let offset = IOMemoryMapper.SCREEN_BASE_ADDRESS + (IOMemoryMapper.SCREEN_WIDTH_IN_BYTES * y) + Math.floor(x / BYTE_SIZE)
        for (let n = 0; n < spriteHeight; n++) {

            let toWrite = this.memory[spriteAddress + n]
            let toWriteMSB = toWrite >> paddingLeft              // if aligned: MSB === toWrite
            let toWriteLSB = isAligned ? 0x00 : (toWrite << paddingRight) & 0xff

            let addressMSB = offset + (IOMemoryMapper.SCREEN_WIDTH_IN_BYTES * n);

            // adjust for vertical wrapping
            let needsToWrap = y + n >= IOMemoryMapper.SCREEN_HEIGHT
            if (needsToWrap) {
                let nWrapped = (y + n) % IOMemoryMapper.SCREEN_HEIGHT
                addressMSB = IOMemoryMapper.SCREEN_BASE_ADDRESS + (IOMemoryMapper.SCREEN_WIDTH_IN_BYTES * nWrapped) + Math.floor(x / BYTE_SIZE)
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
                let needsToWrap = addressLSB % IOMemoryMapper.SCREEN_WIDTH_IN_BYTES === 0
                addressLSB = needsToWrap ? addressLSB - IOMemoryMapper.SCREEN_WIDTH_IN_BYTES : addressLSB

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
        return this.memory[IOMemoryMapper.KEY_PRESSED] === 0xff;
    }

    getPressedKey(): Bit8 | undefined {
        return this.isKeyPressed() ? this.memory[IOMemoryMapper.KEY_VALUE] : undefined;
    }

    isKeyWithValuePressed(value: number): boolean {
        return this.memory[IOMemoryMapper.KEY_PRESSED] === 0xff && this.memory[IOMemoryMapper.KEY_VALUE] === value

    }

    pressKey(key: Bit8): void {
        this.memory[IOMemoryMapper.KEY_VALUE] = key
        this.memory[IOMemoryMapper.KEY_PRESSED] = 0xff
    }

    releaseKey(): void {
        this.memory[IOMemoryMapper.KEY_PRESSED] = 0x00
    }
}