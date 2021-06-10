// @TODO no need to pass a stack, should be init in cpu
import EventEmitter from "events";
import {Bit16, Bit8} from "./types";
import {
    ADD_I_Vx,
    ADD_Vx_kk,
    ADD_Vx_Vy,
    AND,
    CALL,
    CLS,
    DRW,
    JP,
    JP0,
    LD_B_Vx,
    LD_DT_Vx,
    LD_F_Vx,
    LD_I_nnn,
    LD_I_Vx,
    LD_ST_Vx,
    LD_Vx_DT,
    LD_Vx_I,
    LD_Vx_K,
    LD_Vx_kk,
    LD_Vx_Vy,
    Opcode,
    OR,
    parse,
    RET,
    RND,
    SE_Vx_kk,
    SE_Vx_Vy,
    SHL,
    SHR,
    SKNP,
    SKP,
    SNE_Vx_kk,
    SNE_Vx_Vy,
    SUB,
    SUBN,
    XOR
} from "./parse";

export interface CpuOptions {
    memory: Uint8Array,
    stack: Uint16Array,
    programStart: Bit16
}

export class CPU {

    // @TODO remove
    public emitter = new EventEmitter()

    // 16 general purpose 8-bit rs,
    // usually referred to as Vx, where x is a hexadecimal digit (0 through F).
    public rs = new Uint8Array(16)

    // 16-bit register.
    // This register is generally used to store memory addresses
    // so only the lowest (rightmost) 12 bits are usually used.
    //
    // 4KB = 4096 addresses = fff = 12 digits binary
    public registerI: Bit16 = 0

    // Delay Timer register
    // The delay timer is active whenever the delay timer register (DT) is non-zero.
    // This timer does nothing more than subtract 1 from the value of DT at a rate of 60Hz.
    // When DT reaches 0, it deactivates.
    public registerDT: Bit8 = 0

    // Sund Timer register
    // Active whenever the sound timer register (ST) is non-zero.
    // This timer also decrements at a rate of 60Hz,
    // however, as long as ST's value is greater than zero,
    // the Chip-8 buzzer will sound. When ST reaches zero, the sound timer deactivates.
    public registerST: Bit8 = 0


    // program counter
    public pc: Bit16 = 0

    // stack counter
    public sc: Bit8 = 0

    public stack: Uint16Array
    public memory: Uint8Array

    // @TODO let vm pass the base address if it is loading the sprite data
    private static SPRITE_SIZE = 5
    private static SPRITE_BASE_ADDRESS = 0x000
    // memory mapped IO
    // @TODO pass from vm
    public static SCREEN_BASE_ADDRESS = 0x050
    public static SCREEN_WIDTH = 64
    public static SCREEN_WIDTH_IN_BYTES = CPU.SCREEN_WIDTH / 8
    public static SCREEN_HEIGHT = 32
    public static SCREEN_SIZE = CPU.SCREEN_WIDTH * CPU.SCREEN_HEIGHT / 8
    public static KEY_PRESSED = 0x150
    public static KEY_VALUE = 0x151

    constructor({memory, stack, programStart}: CpuOptions) {
        this.memory = memory
        this.stack = stack
        this.pc = programStart
    }

    initialize() {
        // load char set

        let chars = [
            [0xF0, 0x90, 0x90, 0x90, 0xF0], //"0",
            [0x20, 0x60, 0x20, 0x20, 0x70], // "1"
            [0xF0, 0x10, 0xF0, 0x80, 0xF0], // "2"
            [0xF0, 0x10, 0xF0, 0x10, 0xF0], // "3"
            [0x90, 0x90, 0xF0, 0x10, 0x10], // "4"
            [0xF0, 0x80, 0xF0, 0x10, 0xF0], // "5"
            [0xF0, 0x80, 0xF0, 0x90, 0xF0], // "6"
            [0xF0, 0x10, 0x20, 0x40, 0x40], // "7"
            [0xF0, 0x90, 0xF0, 0x90, 0xF0], // "8"
            [0xF0, 0x90, 0xF0, 0x10, 0xF0], // "9"
            [0xF0, 0x90, 0xF0, 0x90, 0x90], // "A"
            [0xE0, 0x90, 0xE0, 0x90, 0xE0], // "B"
            [0xF0, 0x80, 0x80, 0x80, 0xF0], // "C"
            [0xE0, 0x90, 0x90, 0x90, 0xE0], // "D"
            [0xF0, 0x80, 0xF0, 0x80, 0xF0], // "E"
            [0xF0, 0x80, 0xF0, 0x80, 0x80] //  "F
        ];
        let address = CPU.SPRITE_BASE_ADDRESS
        for (let char of chars) {
            for (let byte of char) {
                this.memory[address++] = byte
            }
        }
    }

    tick() {
        // @TODO

        // fetch instructions
        // decode
        // execute
        // update timers
        let opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
        this.pc = this.pc + 2

        let instruction = parse(opcode)

        this.exec(instruction)

        this.updateTimers()


    }

    public exec(instruction: Opcode) {

        // @TODO find a better way to narrow type
        switch (instruction.constructor) {
            case RET: {
                this.pc = this.stack[--this.sc]
                break
            }
            case JP: {
                let i = instruction as JP
                this.pc = i.addr
                break
            }
            case CALL: {
                let i = instruction as CALL
                if (this.sc > 11) throw new Error("CPU error: stack overflow")
                this.stack[this.sc++] = this.pc
                this.pc = i.addr
                break
            }
            case SE_Vx_kk: {
                let i = instruction as SE_Vx_kk
                if (this.rs[i.register] === i.value) this.pc = this.pc + 2
                break
            }
            case SE_Vx_Vy: {
                let i = instruction as SE_Vx_Vy
                if (this.rs[i.registerA] === this.rs[i.registerB]) this.pc = this.pc + 2
                break
            }
            case SNE_Vx_kk: {
                let i = instruction as SNE_Vx_kk
                if (this.rs[i.register] !== i.value) this.pc = this.pc + 2
                break
            }
            case SNE_Vx_Vy: {
                let i = instruction as SNE_Vx_Vy
                if (this.rs[i.registerA] !== this.rs[i.registerB]) this.pc = this.pc + 2
                break
            }
            case LD_F_Vx: {
                let i = instruction as LD_F_Vx
                this.registerI = CPU.SPRITE_BASE_ADDRESS + this.rs[i.register] * CPU.SPRITE_SIZE
                break
            }
            case LD_Vx_kk: {
                let i = instruction as LD_Vx_kk
                this.rs[i.register] = i.value
                break
            }
            case LD_Vx_Vy: {
                let i = instruction as LD_Vx_Vy
                this.rs[i.registerA] = this.rs[i.registerB]
                break
            }
            case ADD_Vx_kk: {
                let i = instruction as ADD_Vx_kk
                this.rs[i.register] = this.rs[i.register] + i.value
                break
            }
            case ADD_Vx_Vy: {
                let i = instruction as ADD_Vx_Vy
                let sum = this.rs[i.registerA] + this.rs[i.registerB]
                this.rs[i.registerA] = sum & 0xff
                this.rs[15] = (sum & (0b1 << 8)) >> 8
                break
            }
            case ADD_I_Vx: {
                let i = instruction as ADD_I_Vx
                this.registerI = this.registerI + this.rs[i.register]
                break
            }
            case OR: {
                let i = instruction as OR
                this.rs[i.registerA] = this.rs[i.registerA] | this.rs[i.registerB]
                break
            }
            case AND: {
                let i = instruction as AND
                this.rs[i.registerA] = this.rs[i.registerA] & this.rs[i.registerB]
                break
            }
            case XOR: {
                let i = instruction as XOR
                this.rs[i.registerA] = this.rs[i.registerA] ^ this.rs[i.registerB]
                break
            }
            case SUB: {
                let i = instruction as SUB
                this.rs[15] = this.rs[i.registerA] > this.rs[i.registerB] ? 0x01 : 0x00
                this.rs[i.registerA] = this.rs[i.registerA] - this.rs[i.registerB]
                break
            }
            case SUBN: {
                let i = instruction as SUBN
                this.rs[15] = this.rs[i.registerB] > this.rs[i.registerA] ? 0x01 : 0x00
                this.rs[i.registerA] = this.rs[i.registerB] - this.rs[i.registerA]
                break
            }
            case RND: {
                let i = instruction as RND
                this.rs[i.register] = Math.floor(Math.random() * 0x100) & i.value
                break
            }
            case SHR: {
                let i = instruction as SHR
                this.rs[15] = this.rs[i.register] & 0b1
                this.rs[i.register] = this.rs[i.register] >> 1
                break
            }
            case SHL: {
                let i = instruction as SHL
                this.rs[15] = (this.rs[i.register] & 0b10000000) >> 7
                this.rs[i.register] = this.rs[i.register] << 1
                break
            }
            // @TODO mybe rename to LD_I
            case LD_I_nnn: {
                let i = instruction as LD_I_nnn
                this.registerI = i.address
                break
            }
            case LD_Vx_DT: {
                let i = instruction as LD_Vx_DT
                this.rs[i.register] = this.registerDT
                break
            }
            case LD_DT_Vx: {
                let i = instruction as LD_DT_Vx
                this.registerDT = this.rs[i.register]
                break
            }
            case LD_ST_Vx: {
                let i = instruction as LD_ST_Vx
                this.registerST = this.rs[i.register]
                break
            }
            case JP0: {
                let i = instruction as JP0
                // @TODO check for memory out of bounds error?
                this.pc = this.rs[0] + i.address
                break
            }
            case LD_I_Vx: {
                let i = instruction as LD_I_Vx
                for (let n = 0; n <= i.register; n++)
                    this.memory[this.registerI + n] = this.rs[n]
                break
            }
            case LD_Vx_I: {
                let i = instruction as LD_Vx_I
                for (let n = 0; n <= i.register; n++)
                    this.rs[n] = this.memory[this.registerI + n]
                break
            }
            case LD_B_Vx: {
                // BCD: Binary Coded Decimal: https://en.wikipedia.org/wiki/Binary-coded_decimal
                let i = instruction as LD_B_Vx
                let n = this.rs[i.register]
                // hundreds
                this.memory[this.registerI] = Math.floor(n / 100)
                // tens
                this.memory[this.registerI + 1] = Math.floor((n % 100) / 10)
                // ones
                this.memory[this.registerI + 2] = (n % 100) % 10
                break
            }
            case LD_Vx_K: {
                // To wait for a keypress we keep reevaluating this instruction until a key is pressed.
                // Resetting the program counter to the previous instruction forces reevaluation of this instruction
                // in the next cycle.
                let i = instruction as LD_Vx_K
                let isKeyPressed = this.memory[CPU.KEY_PRESSED] === 0xff
                if (!isKeyPressed) {
                    this.pc = this.pc - 2
                    break
                }
                this.rs[i.register] = this.memory[CPU.KEY_VALUE]
                // No need to increment the program counter with 2 as this is done automatically in each tick
                break
            }
            case CLS: {
                let screenBegin = CPU.SCREEN_BASE_ADDRESS
                let screenEnd = CPU.SCREEN_BASE_ADDRESS + CPU.SCREEN_SIZE

                // flip app bits off
                for (let i = screenBegin; i < screenEnd; i++)
                    this.memory[i] = 0x00

                // @TODO better interface
                this.emitter.emit("screenCleared")

                break
            }
            case DRW: {
                // @TODO clean up
                const BYTE_SIZE = 8
                let i = instruction as DRW
                let pixelsErased = false
                let coordinateX = this.rs[i.registerA]
                let coordinateY = this.rs[i.registerB]

                if (coordinateX === undefined || coordinateY === undefined) throw new Error(`CPU exec draw no coordinate ${coordinateX} ${coordinateY}`)

                let isAligned = coordinateX % BYTE_SIZE === 0

                // If not aligned: write 2 bytes padded with zeros
                // Ex:
                //     |10011001|        | => with 3 bits padded on the left
                //     |   10011|001     |

                let paddingLeft = coordinateX % BYTE_SIZE
                let paddingRight = BYTE_SIZE - paddingLeft

                let offset = CPU.SCREEN_BASE_ADDRESS + (CPU.SCREEN_WIDTH_IN_BYTES * coordinateY) + Math.floor(coordinateX / BYTE_SIZE)
                for (let n = 0; n < i.nibble; n++) {

                    let toWrite = this.memory[this.registerI + n]
                    let toWriteMSB = toWrite >> paddingLeft              // if aligned: MSB === toWrite
                    let toWriteLSB = isAligned ? 0x00 : (toWrite << paddingRight) & 0xff

                    let addressMSB = offset + (CPU.SCREEN_WIDTH_IN_BYTES * n);

                    // adjust for vertical wrapping
                    let needsToWrap = coordinateY + n >= CPU.SCREEN_HEIGHT
                    if (needsToWrap) {
                        let nWrapped = (coordinateY + n) % CPU.SCREEN_HEIGHT
                        addressMSB = CPU.SCREEN_BASE_ADDRESS + (CPU.SCREEN_WIDTH_IN_BYTES * nWrapped) + Math.floor(coordinateX / BYTE_SIZE)
                    }

                    {
                        let read = this.memory[addressMSB]
                        let toWrite = read ^ toWriteMSB
                        this.memory[addressMSB] = toWrite


                        this.emitter.emit("screenUpdated", addressMSB, toWrite)

                        // check if we erased a pixel
                        // since XOR is stricter than OR, if they are not the same,
                        // it means we erased at least one pixel
                        pixelsErased = pixelsErased || (toWrite !== (read | toWriteMSB))
                    }

                    if (!isAligned) {
                        let addressLSB = addressMSB + 1;

                        // correct for horizontal wrapping
                        let needsToWrap = addressLSB % CPU.SCREEN_WIDTH_IN_BYTES === 0
                        addressLSB = needsToWrap ? addressLSB - CPU.SCREEN_WIDTH_IN_BYTES : addressLSB

                        let read = this.memory[addressLSB];
                        let toWrite = read ^ toWriteLSB
                        this.memory[addressLSB] = toWrite

                        this.emitter.emit("screenUpdated", addressLSB, toWrite)


                        // check if we erased a pixel
                        pixelsErased = pixelsErased || (toWrite !== (read | toWriteLSB))
                    }
                }

                this.rs[0xf] = pixelsErased ? 0x01 : 0x00

                break
            }
            case SKP: {
                let i = instruction as SKP
                let isKeyPressed = this.memory[CPU.KEY_PRESSED] === 0xff && this.memory[CPU.KEY_VALUE] === this.rs[i.register]
                if (isKeyPressed) this.pc = this.pc + 2
                break
            }
            case SKNP: {
                let i = instruction as SKNP
                let isKeyPressed = this.memory[CPU.KEY_PRESSED] === 0xff && this.memory[CPU.KEY_VALUE] === this.rs[i.register]
                if (!isKeyPressed) this.pc = this.pc + 2
                break
            }
            default:
                throw new Error(`CPU exec error: not implemented ${instruction.constructor.name}`)
        }
    }

    private updateTimers() {
        // @TODO real implementation timers
        if (this.registerST > 0) {
            this.registerST--
        }

        if (this.registerDT > 0) {
            this.registerDT--
        }

    }
}