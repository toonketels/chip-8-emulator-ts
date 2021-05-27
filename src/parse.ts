import {Bit12, Bit16, Bit4, Bit8} from "./types";
import exp from "constants";

// 00E0 - CLS
// Clear the display
export class CLS {}

// 00EE - RET
// Return from a subroutine.
// The interpreter sets the program counter # to the address at the top of the stack, # then subtracts 1 from the stack pointer.
export class RET {}

// 1nnn - JP addr
// Jump to location nnn.
// The interpreter sets the program counter to nnn.
export class JP { constructor(readonly addr: Bit12) {} }

// 2nnn - CALL addr
// Call subroutine at nnn.
// The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
export class CALL { constructor(readonly addr: Bit12) {} }

// 3xkk - SE Vx, byte
// Skip next instruction if Vx = kk.
// The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
export class SE_Vx_kk { constructor(readonly register: Bit4, readonly value: Bit8) {} }

// 4xkk - SNE Vx, byte
// Skip next instruction if Vx != kk.
// The interpreter compares register Vx to kk, and if they are not equal, increments the program counter by 2.
export class SNE { constructor(readonly register: Bit4, readonly value: Bit8) {} }

// 5xy0 - SE Vx, Vy
// Skip next instruction if Vx = Vy.
// The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
export class SE_Vx_Vy { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {} }

// 6xkk - LD Vx, byte
// Set Vx = kk.
// The interpreter puts the value kk into register Vx.
export class LD_Vx_kk { constructor(readonly register: Bit4, readonly value: Bit8) {}}

// 7xkk - ADD Vx, byte
// Set Vx = Vx + kk.
// Adds the value kk to the value of register Vx, then stores the result in Vx.
export class ADD_Vx_kk { constructor(readonly register: Bit4, readonly value: Bit8 ){} }

// 8xy0 - LD Vx, Vy
// Set Vx = Vy.
// Stores the value of register Vy in register Vx.
export class LD_Vx_Vy { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {} }

// 8xy1 - OR Vx, Vy
// Set Vx = Vx OR Vy.
//
// Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx. A bitwise OR compares the corrseponding bits from two values, and if either bit is 1, then the same bit in the result is also 1. Otherwise, it is 0.
export class OR { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {} }

// 8xy2 - AND Vx, Vy
// Set Vx = Vx AND Vy.
// Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx. A bitwise AND compares the corrseponding bits from two values, and if both bits are 1, then the same bit in the result is also 1. Otherwise, it is 0.
export class AND { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {} }

// 8xy3 - XOR Vx, Vy
// Set Vx = Vx XOR Vy.
//
// Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx. An exclusive OR compares the corrseponding bits from two values, and if the bits are not both the same, then the corresponding bit in the result is set to 1. Otherwise, it is 0.
export class XOR { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {} }


// 8xy4 - ADD Vx, Vy
// Set Vx = Vx + Vy, set VF = carry.
//
// The values of Vx and Vy are added together. If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0. Only the lowest 8 bits of the result are kept, and stored in Vx.
export class ADD_Vx_Vy { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {}}

// 8xy5 - SUB Vx, Vy
// Set Vx = Vx - Vy, set VF = NOT borrow.
//
// If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
export class SUB { constructor(readonly registerA: Bit4, readonly registerB: Bit4) {} }

// 8xy6 - SHR Vx {, Vy}
// Set Vx = Vx SHR 1.
//
// If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
export class SHR { constructor(readonly registerA: Bit4) {} }

// 8xy7 - SUBN Vx, Vy
// Set Vx = Vy - Vx, set VF = NOT borrow.
//
// If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.
export class SUBN { constructor(readonly registerA: Bit4, readonly registerB: Bit4) { } }

// 8xyE - SHL Vx {, Vy}
// Set Vx = Vx SHL 1.
//
// If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2.
export class SHL { constructor(readonly registerA: Bit4, readonly registerB: Bit4) { } }

// 9xy0 - SNE Vx, Vy
// Skip next instruction if Vx != Vy.
//
// The values of Vx and Vy are compared, and if they are not equal, the program counter is increased by 2.
export class SNER { constructor(readonly registerA: Bit4, readonly registerB: Bit4) { } }

// Annn - LD I, addr
// Set I = nnn.
//
// The value of register I is set to nnn.
export class LDI { constructor(readonly address: Bit12) { } }

// Bnnn - JP V0, addr
// Jump to location nnn + V0.
//
// The program counter is set to nnn plus the value of V0.
export class JP0 { constructor(readonly address: Bit12) { } }

// Cxkk - RND Vx, byte
// Set Vx = random byte AND kk.
//
// The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk. The results are stored in Vx. See instruction 8xy2 for more information on AND.
export class RND { constructor(readonly register: Bit4, readonly value: Bit8) {} }

// Dxyn - DRW Vx, Vy, nibble
// Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
//
// The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 2.4, Display, for more information on the Chip-8 screen and sprites.
export class DRW { constructor(readonly registerA: Bit4, readonly registerB: Bit4, readonly nibble: Bit4) {}}

// Ex9E - SKP Vx
// Skip next instruction if key with the value of Vx is pressed.
//
// Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
export class SKP { constructor(readonly register: Bit4) {} }

// ExA1 - SKNP Vx
// Skip next instruction if key with the value of Vx is not pressed.
//
// Checks the keyboard, and if the key corresponding to the value of Vx is currently in the start position, PC is increased by 2.
export class SKNP { constructor(readonly register: Bit4) {} }

// Fx07 - LD Vx, DT
// Set Vx = delay timer value.
//
// The value of DT is placed into Vx.
export class LDXDT { constructor(readonly register: Bit4) {} }

// Fx0A - LD Vx, K
// Wait for a key press, store the value of the key in Vx.
//
// All execution stops until a key is pressed, then the value of that key is stored in Vx.
export class LDK { constructor(readonly register: Bit4) {} }

// Fx15 - LD DT, Vx
// Set delay timer = Vx.
//
// DT is set equal to the value of Vx.
export class LDDTX { constructor(readonly register: Bit4) {} }


// Fx18 - LD ST, Vx
// Set sound timer = Vx.
//
// ST is set equal to the value of Vx.
export class LDSTX { constructor(readonly register: Bit4) {} }

// Fx1E - ADD I, Vx
// Set I = I + Vx.
//
// The values of I and Vx are added, and the results are stored in I.
export class ADDIX { constructor(readonly register: Bit4) {} }

// Fx29 - LD F, Vx
// Set I = location of sprite for digit Vx.
//
// The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx. See section 2.4, Display, for more information on the Chip-8 hexadecimal font.
export class LDFX { constructor(readonly register: Bit4) {} }

// Fx33 - LD B, Vx
// Store BCD representation of Vx in memory locations I, I+1, and I+2.
//
// The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.
export class LDBX { constructor(readonly register: Bit4) {} }

// Fx55 - LD [I], Vx
// Store rs V0 through Vx in memory starting at location I.
//
// The interpreter copies the values of rs V0 through Vx into memory, starting at the address in I.
export class LDIX { constructor(readonly register: Bit4) {} }

// Fx65 - LD Vx, [I]
// Read rs V0 through Vx from memory starting at location I.
//
// The interpreter reads values from memory starting at location I into rs V0 through Vx.
export class LDXI { constructor(readonly register: Bit4) {} }


    export type Opcode = CLS | RET | JP | CALL | SE_Vx_kk | SE_Vx_Vy | LD_Vx_kk |
                     ADD_Vx_kk | LD_Vx_Vy | OR | AND | XOR | ADD_Vx_Vy | SUB | SHR | SUBN | SHL |
                     SNER | LDI | JP0 | RND | DRW | SKP | SKNP | LDXDT | LDK |
                     LDDTX | LDSTX | ADDIX | LDFX | LDBX | LDIX | LDXI

export function split4Bit4(opcode: Bit16): [Bit4, Bit4, Bit4, Bit4] {
    let a = (opcode & (0xf << 12)) >> 12
    let b = (opcode & (0xf << 8)) >> 8
    let c = (opcode & (0xf << 4)) >> 4
    let d = opcode & 0xf

    return [a, b, c, d]
}

export function findAddress(opcode: Bit16): Bit12 {
    return opcode & 0xfff
}

export function findValue(opcode: Bit16):  Bit8 {
    return opcode & 0xff
}

export function parse(opcode: Bit16): Opcode {

    const [code, a, b, n] = split4Bit4(opcode)
    const address = findAddress(opcode)
    const value = findValue(opcode)

    switch (code) {
        case 0x0: switch (opcode) {
            case 0x00E0: return new CLS()
            case 0x00EE: return new RET()
            default: error(opcode)
        }
        case 0x1: return new JP(address)
        case 0x2: return new CALL(address)
        case 0x3: return new SE_Vx_kk(a, value)
        case 0x4: return new SNE(a, value)
        case 0x5: if (n === 0) { return new SE_Vx_Vy(a, b) } else break
        case 0x6: return new LD_Vx_kk(a, value)
        case 0x7: return new ADD_Vx_kk(a, value)
        case 0x8: switch (n) {
            case 0x0: return new LD_Vx_Vy(a, b)
            case 0x1: return new OR(a, b)
            case 0x2: return new AND(a, b)
            case 0x3: return new XOR(a, b)
            case 0x4: return new ADD_Vx_Vy(a, b)
            case 0x5: return new SUB(a, b)
            case 0x6: return new SHR(a)
            case 0x7: return new SUBN(a, b)
            case 0xe: return new SHL(a, b)
            default: error(opcode)
        }
        case 0x9: if (n === 0) { return new SNER(a, b) } else break
        case 0xa: return new LDI(address)
        case 0xb: return new JP0(address)
        case 0xc: return new RND(a, value)
        case 0xd: return new DRW(a, b, n)
        case 0xe: if (b === 0x9 && n === 0xe) return new SKP(a)
        case 0xe: if (b === 0xa && n === 0x1) return new SKNP(a)
        case 0xf: if (b === 0x0 && n === 0x7) return new LDXDT(a)
        case 0xf: if (b === 0x0 && n === 0xa) return new LDK(a)
        case 0xf: if (b === 0x1 && n === 0x5) return new LDDTX(a)
        case 0xf: if (b === 0x1 && n === 0x8) return new LDSTX(a)
        case 0xf: if (b === 0x1 && n === 0xe) return new ADDIX(a)
        case 0xf: if (b === 0x2 && n === 0x9) return new LDFX(a)
        case 0xf: if (b === 0x3 && n === 0x3) return new LDBX(a)
        case 0xf: if (b === 0x5 && n === 0x5) return new LDIX(a)
        case 0xf: if (b === 0x6 && n === 0x5) return new LDXI(a)
    }


    error(opcode)

    function error(opcode: Bit16): never {
        throw new Error(`Parse error: unknown opcode ${opcode.toString(16)}`)
    }
}
