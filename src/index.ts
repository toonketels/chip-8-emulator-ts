import {Bit16, Bit8} from "./types";


export class Cpu {

    // 16 general purpose 8-bit registers,
    // usually referred to as Vx, where x is a hexadecimal digit (0 through F).
    public registers = new Int8Array(16)

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
    public programCounter: Bit16 = 0

    // stack counter
    public stackCounter: Bit8 = 0
}

export class VM {
    private static size_4K: number = 4096
    private static size_stack: number = 16

    // An array of 16 16-bit values
    // used to store the address that the interpreter shoud return to when finished with a subroutine.
    // Chip-8 allows for up to 16 levels of nested subroutines.
    public stack = new Int16Array(VM.size_stack)

    // 4KB RAM, from location 0x000 (0) to 0xFFF (4095)
    //
    // 0x000  (0)
    //               512 bytes for original interpreter was located, and should not be used by programs
    // 0x1FF  (511)
    // 0x200  (512) Start of most Chip-8 programs
    //
    // 0x600 (1536) Start of ETI 660 Chip-8 programs
    //
    //              Chip-8 program/data space
    //
    // 0xFFF (4095)  End of Chip-8 RAM
    public memory = new Int8Array(VM.size_4K)
    public cpu = new Cpu()
}

