import {
    ADD_Vx_kk,
    ADD_Vx_Vy,
    AND,
    CALL,
    JP, JP0, LD_I_nnn,
    LD_Vx_kk,
    LD_Vx_Vy, LD_DT_Vx,
    OR,
    SE_Vx_kk,
    SE_Vx_Vy, SHL,
    SHR,
    SNE_Vx_kk, SNE_Vx_Vy,
    SUB, SUBN,
    XOR, LD_Vx_DT, LD_ST_Vx, ADD_I_Vx, LD_I_Vx, LD_Vx_I, RND, RET, LD_F_Vx, LD_B_Vx, CLS, SKP, SKNP, LD_Vx_K, DRW
} from "../decode";
import {Bit12, Bit8} from "../types";
import {CPU, CpuOptions} from "../cpu";
import {IoManager} from "../ioManager";
import {IO} from "../io";



describe("exec", () => {

    describe("CLS", () => {
        test("Clear the display", () => {

            let cpu = aCPU({ memory: new Uint8Array(0x200)})
            paintScreen();

            cpu.exec(new CLS())
            expectScreenCleared();

            function paintScreen() {
                // paint on screen by flipping bits to 1
                for (let i = 0; i < IoManager.SCREEN_SIZE; i++)
                    cpu.memory[IoManager.SCREEN_BASE_ADDRESS + i] = 0xff
            }

            function expectScreenCleared() {
                // all pixels off means all bits to 0
                for (let i = 0; i < IoManager.SCREEN_SIZE; i++) {
                    expect(cpu.memory[IoManager.SCREEN_BASE_ADDRESS + i]).toEqual(0x00)
                }
            }
        })
    })

    describe("RET", () => {
        test("Return from a subroutine.", () => {
            let cpu = aCPU()
            cpu.pc = 0x400
            cpu.stack[0] = 0x300
            cpu.stack[1] = 0x350
            cpu.sc = 2

            cpu.exec(new RET())
            expect(cpu.pc).toEqual(0x350)
            expect(cpu.sc).toEqual(1)
        })
    })

    describe("JP addr", () => {
        test("Jump to location nnn", () => {
            let cpu = aCPU();
            cpu.exec(new JP(0x0ff))
            expect(cpu.pc).toEqual(0x0ff)
        })
    })

    describe("CALL addr", () => {
        test("Call subroutine at nnn", () => {
            let cpu = aCPU({programStart: 0x200})

            cpu.exec(new CALL(0x2ff))
            cpu.exec(new CALL(0x4ff))

            expect(cpu.stack[0]).toEqual(0x200)
            expect(cpu.stack[1]).toEqual(0x2ff)
            expect(cpu.pc).toEqual(0x4ff)
        })

        test("CALL throws stack overflow", () => {
            let cpu = aCPU({programStart: 0x200})
            new Array(12).fill(0).forEach((value, index) => cpu.exec(new CALL(index)))
            expect(() => cpu.exec(new CALL(0xfff))).toThrowError("CPU error: stack overflow")
        })
    })

    describe("SE Vx, byte", () => {
        test("Skip next instruction if Vx = kk", () => {
            let cpu = aCPU({programStart: 0x200})
            cpu.rs[5] = 0x9

            cpu.exec(new SE_Vx_kk(4, 0x9))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SE_Vx_kk(5, 0x0))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SE_Vx_kk(5, 0x9))
            expect(cpu.pc).toEqual(0x202)
        })
    })

    describe("SE Vx, Vy", () => {
        test("Skip next instruction if Vx = Vy", () => {
            let cpu = aCPU({programStart: 0x200})
            cpu.rs[5] = 0x9
            cpu.rs[6] = 0x9
            cpu.rs[7] = 0x4

            cpu.exec(new SE_Vx_Vy(5, 7))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SE_Vx_Vy(5, 5))
            expect(cpu.pc).toEqual(0x202)

            cpu.exec(new SE_Vx_Vy(5, 6))
            expect(cpu.pc).toEqual(0x204)
        })
    })

    describe("SNE Vx, byte", () => {
        test("Skip next instruction if Vx != kk", () => {
            let cpu = aCPU({programStart: 0x200})
            cpu.rs[5] = 0x9

            cpu.exec(new SNE_Vx_kk(5, 0x9))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SNE_Vx_kk(5, 0x0))
            expect(cpu.pc).toEqual(0x202)
        })
    })

    describe("SNE Vx, Vy", () => {
        test("Skip next instruction if Vx != Vy", () => {
            let cpu = aCPU({programStart: 0x200})
            cpu.rs[5] = 0x9
            cpu.rs[6] = 0x9
            cpu.rs[7] = 0x4

            cpu.exec(new SNE_Vx_Vy(5, 6))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SNE_Vx_Vy(5, 5))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SNE_Vx_Vy(5, 7))
            expect(cpu.pc).toEqual(0x202)
        })
    })


    describe("LD Vx, byte", () => {
        test("Set Vx = kk", () => {
            let cpu = aCPU()
            cpu.exec(new LD_Vx_kk(5, 0xaa))
            expect(cpu.rs[5]).toEqual(0xaa)
        })
    })


    describe("ADD Vx, byte", () => {
        test("Set Vx = Vx + kk", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0x01
            cpu.exec(new ADD_Vx_kk(0x1, 0x10))
            expect(cpu.rs[1]).toEqual(0x11)
        })
    })

    describe("LD Vx, Vy", () => {
        test("Set Vx = Vy", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0x01
            cpu.rs[2] = 0xff
            cpu.exec(new LD_Vx_Vy(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0xff)
        })
    })


    describe("OR Vx, Vy", () => {
        test("Set Vx = Vx OR Vy", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0b10010011
            cpu.rs[2] = 0b01001001
            cpu.exec(new OR(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0b11011011)
            expect(cpu.rs[2]).toEqual(0b01001001)
        })
    })

    describe("AND Vx, Vy", () => {
        test("Set Vx = Vx AND Vy", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0b10010011
            cpu.rs[2] = 0b11001001
            cpu.exec(new AND(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0b10000001)
            expect(cpu.rs[2]).toEqual(0b11001001)
        })
    })



    describe("XOR Vx, Vy", () => {
        test("Set Vx = Vx XOR Vy", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0b10010011
            cpu.rs[2] = 0b11001001
            cpu.exec(new XOR(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0b01011010)
            expect(cpu.rs[2]).toEqual(0b11001001)
        })
    })

    describe("ADD Vx, Vy", () => {
        test("Set Vx = Vx + Vy, set VF = carry", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0xff
            cpu.rs[2] = 0xfe
            cpu.rs[3] = 0x01

            cpu.exec(new ADD_Vx_Vy(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0xfd)
            expect(cpu.rs[2]).toEqual(0xfe)
            expect(cpu.rs[15]).toEqual(0x01)

            // Verify carry over bit is cleared
            cpu.exec(new ADD_Vx_Vy(0x1, 0x3))
            expect(cpu.rs[1]).toEqual(0xfe)
            expect(cpu.rs[3]).toEqual(0x01)
            expect(cpu.rs[15]).toEqual(0x00)
        })
    })

    describe("SUB Vx, Vy", () => {
        test("Set Vx = Vx - Vy, set VF = NOT borrow", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0x05
            cpu.rs[2] = 0x03
            cpu.rs[3] = 0xff

            cpu.exec(new SUB(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0x02)
            expect(cpu.rs[2]).toEqual(0x03)
            expect(cpu.rs[15]).toEqual(0x01)

            // without flag
            cpu.exec(new SUB(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0xff)
            expect(cpu.rs[15]).toEqual(0x00)

            // subtract from itself should be 0
            cpu.exec(new SUB(0x1, 0x1))
            expect(cpu.rs[1]).toEqual(0x00)
            expect(cpu.rs[15]).toEqual(0x00)

            // subtract biggest number from 0
            cpu.exec(new SUB(0x1, 0x3))
            expect(cpu.rs[1]).toEqual(0x01)
            expect(cpu.rs[15]).toEqual(0x00)
        })
    })

    describe("SUBN Vx, Vy", () => {
        test("Set Vx = Vy - Vx, set VF = NOT borrow", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0x03
            cpu.rs[2] = 0x05
            cpu.rs[3] = 0x09

            cpu.exec(new SUBN(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0x02)
            expect(cpu.rs[2]).toEqual(0x05)
            expect(cpu.rs[15]).toEqual(0x01)

            cpu.exec(new SUBN(0x3, 0x1))
            expect(cpu.rs[3]).toEqual(0xf9)
            expect(cpu.rs[15]).toEqual(0x00)
        })
    })

    describe("SHR Vx {, Vy}", () => {
        test("Set Vx = Vx SHR 1", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0b00111111
            cpu.rs[2] = 0b00111100

            cpu.exec(new SHR(0x1))
            expect(cpu.rs[1]).toEqual(0b00011111)
            expect(cpu.rs[15]).toEqual(0x01)

            cpu.exec(new SHR(0x2))
            expect(cpu.rs[2]).toEqual(0b00011110)
            expect(cpu.rs[15]).toEqual(0x00)
        })
    })


    describe("SHL Vx {, Vy}", () => {
        test("Set Vx = Vx SHL 1", () => {
            let cpu = aCPU()
            cpu.rs[1] = 0b00111111
            cpu.rs[2] = 0b10111100

            cpu.exec(new SHL(0x1))
            expect(cpu.rs[1]).toEqual(0b01111110)
            expect(cpu.rs[15]).toEqual(0x00)

            cpu.exec(new SHL(0x2))
            expect(cpu.rs[2]).toEqual(0b01111000)
            expect(cpu.rs[15]).toEqual(0x01)
        })
    })

    describe("LD I, addr", () => {
        test("Set I = nnn", () => {
            let cpu = aCPU()
            cpu.exec(new LD_I_nnn(0xefe))
            expect(cpu.registerI).toEqual(0xefe)
        })
    })

    describe("JP V0, addr", () => {
        test("Jump to location nnn + V0", () => {
            let cpu = aCPU({programStart: 0x200})
            cpu.rs[0] = 0x30

            cpu.exec(new JP0(0x2ff))
            expect(cpu.pc).toEqual(0x32f)
        })
    })

    // @TODO add deterministic pseudo random number generator?
    describe("RND Vx, byte", () => {
        test("Set Vx = random byte AND kk", () => {

            let cpu = aCPU()
            let instruction = new RND(0x4, 0xef)

            let values = new Array(10)
                .fill(0)
                .map((v, i) => {
                    cpu.exec(instruction)
                    return cpu.rs[0x4]
                })

            expectSomewhatRandom(values)

            function expectSomewhatRandom(values: number[]) {
                // Check we have mostly different values.
                // Not a real randomness through uniform
                // distribution check but good enough.
                const threshold = 3
                let duplicates = 0
                let previous = undefined
                for (let value of values.sort()) {
                    if (value === previous) duplicates++
                    previous = value
                }
                expect(duplicates).toBeLessThanOrEqual(threshold)
            }
        })
    })

    describe("DRW Vx, Vy, nibble", () => {
        // The interpreter reads n bytes from memory,
        // starting at the address stored in I.
        // These bytes are then displayed as sprites on screen at coordinates (Vx, Vy).
        // Sprites are XORed onto the existing screen.
        // If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0.
        // If the sprite is positioned so part of it is outside the coordinates of the display,
        // it wraps around to the opposite side of the screen.
        // See instruction 8xy3 for more information on XOR, and section 2.4, Display,
        // for more information on the Chip-8 screen and sprites.

        test("Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision", () => {
            let cpu = aCPU({memory: new Uint8Array(0x300)})
            cpu.rs[0x0] = 32
            cpu.rs[0x1] = 14

            cpu.registerI = 0x200

            cpu.memory[0x200] = 0b11110000
            cpu.memory[0x201] = 0b10010000
            cpu.memory[0x202] = 0b10010000
            cpu.memory[0x203] = 0b11110000

            cpu.exec(new DRW(0x0, 0x1, 0x4))

            expect(print(cpu)).toMatchSnapshot()
        })

        test.each([
            [[0xF0, 0x90, 0x90, 0x90, 0xF0], "0"],
            [[0x20, 0x60, 0x20, 0x20, 0x70], "1"],
            [[0xF0, 0x10, 0xF0, 0x80, 0xF0], "2"],
            [[0xF0, 0x10, 0xF0, 0x10, 0xF0], "3"],
            [[0x90, 0x90, 0xF0, 0x10, 0x10], "4"],
            [[0xF0, 0x80, 0xF0, 0x10, 0xF0], "5"],
            [[0xF0, 0x80, 0xF0, 0x90, 0xF0], "6"],
            [[0xF0, 0x10, 0x20, 0x40, 0x40], "7"],
            [[0xF0, 0x90, 0xF0, 0x90, 0xF0], "8"],
            [[0xF0, 0x90, 0xF0, 0x10, 0xF0], "9"],
            [[0xF0, 0x90, 0xF0, 0x90, 0x90], "A"],
            [[0xE0, 0x90, 0xE0, 0x90, 0xE0], "B"],
            [[0xF0, 0x80, 0x80, 0x80, 0xF0], "C"],
            [[0xE0, 0x90, 0x90, 0x90, 0xE0], "D"],
            [[0xF0, 0x80, 0xF0, 0x80, 0xF0], "E"],
            [[0xF0, 0x80, 0xF0, 0x80, 0x80], "F"]
        ])("renders %s as %s to screen", (input: Bit8[]) => {
            let cpu = aCPU({memory: new Uint8Array(0x300)})
            cpu.rs[0x0] = 32
            cpu.rs[0x1] = 6
            let addr = 0x200

            cpu.registerI = addr
            for (let [index, value] of input.entries()) {
                cpu.memory[addr + index] = value
            }

            cpu.exec(new DRW(0x0, 0x1, 5))

            expect(print(cpu)).toMatchSnapshot()
        })

        test("Adds padding to align bytes in memory when drawing pixels on x coordinate", () => {
            let cpu = aCPU({memory: new Uint8Array(0x300)})
            cpu.rs[0x0] = 3
            cpu.rs[0x1] = 1

            cpu.registerI = 0x200

            cpu.memory[0x200] = 0b11111111
            cpu.memory[0x201] = 0b10011001
            cpu.memory[0x202] = 0b10011001
            cpu.memory[0x203] = 0b11111111

            // x coordinate does not fall exactly on the byte boundary
            cpu.exec(new DRW(0x0, 0x1, 0x4))

            expect(print(cpu)).toMatchSnapshot()
        })

        test("Handles pixel collision", () => {

            let cpu = aCPU({memory: new Uint8Array(0x300)})

            cpu.rs[0x0] = 5
            cpu.rs[0x1] = 1
            cpu.rs[0x2] = 10
            cpu.rs[0x3] = 3

            cpu.registerI = 0x200

            cpu.memory[0x200] = 0xff
            cpu.memory[0x201] = 0xff
            cpu.memory[0x202] = 0xff
            cpu.memory[0x203] = 0xff

            cpu.exec(new DRW(0x0, 0x1, 0x4))
            expect(cpu.rs[0xf]).toEqual(0x00)
            expect(print(cpu)).toMatchSnapshot()

            cpu.exec(new DRW(0x2, 0x3, 0x4))
            expect(cpu.rs[0xf]).toEqual(0x01)
            expect(print(cpu)).toMatchSnapshot()

        })

        test("Handles horizontal wrapping", () => {
            let cpu = aCPU({memory: new Uint8Array(0x300)})

            cpu.rs[0x0] = IoManager.SCREEN_WIDTH - 4
            cpu.rs[0x1] = 2

            cpu.registerI = 0x200

            cpu.memory[0x200] = 0b10111101
            cpu.memory[0x201] = 0b10111101
            cpu.memory[0x202] = 0b10111101
            cpu.memory[0x203] = 0b10111101

            // @TODO check if srceen is correct with
            cpu.exec(new DRW(0x0, 0x1, 0x4))
            expect(print(cpu)).toMatchSnapshot()
        })

        test("Handles vertical wrapping", () => {
            let cpu = aCPU({memory: new Uint8Array(0x300)})

            cpu.rs[0x0] = 4
            cpu.rs[0x1] = IoManager.SCREEN_HEIGHT - 2
            cpu.registerI = 0x200

            cpu.memory[0x200] = 0b11011111
            cpu.memory[0x201] = 0b11101111
            cpu.memory[0x202] = 0b11110111
            cpu.memory[0x203] = 0b11111011

            cpu.exec(new DRW(0x0, 0x1, 0x4))
            expect(print(cpu)).toMatchSnapshot()
        })
    })

    describe("SKP Vx", () => {
        test("Skip next instruction if key with the value of Vx is pressed", () => {
            // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position,
            // PC is increased by 2.

            let cpu = aCPU({memory: new Uint8Array(0x200)})
            cpu.rs[0x1] = 0x9
            cpu.pc = 0x200

            // skip
            pressKey(cpu,0x9);
            cpu.exec(new SKP(0x1))
            expect(cpu.pc).toEqual(0x202)

            // no skip
            releaseKey(cpu)
            cpu.exec(new SKP(0x1))
            expect(cpu.pc).toEqual(0x202)

            // no skip
            pressKey(cpu,0xf)
            cpu.exec(new SKP(0x1))
            expect(cpu.pc).toEqual(0x202)
        })
    })

    describe("SKNP Vx", () => {
        test("Skip next instruction if key with the value of Vx is not pressed", () => {
            // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the start position,
            // PC is increased by 2.

            let cpu = aCPU({memory: new Uint8Array(0x200)})
            cpu.rs[0x1] = 0x9
            cpu.pc = 0x200

            // no skip
            pressKey(cpu, 0x9);
            cpu.exec(new SKNP(0x1))
            expect(cpu.pc).toEqual(0x200)

            // skip bc not pressed
            releaseKey(cpu)
            cpu.exec(new SKNP(0x1))
            expect(cpu.pc).toEqual(0x202)

            // skip bc different key
            pressKey(cpu, 0xf)
            cpu.exec(new SKNP(0x1))
            expect(cpu.pc).toEqual(0x204)
        })
    })

    describe("LD Vx, DT", () => {
        test("Set Vx = delay timer value", () => {
            let cpu = aCPU()
            cpu.registerDT = 0xee
            cpu.exec(new LD_Vx_DT(0x1))
            expect(cpu.rs[0x1]).toEqual(0xee)
        })
    })


    describe("LD Vx, K", () => {
        test("Wait for a key press, store the value of the key in Vx", () => {
            // All execution stops until a key is pressed, then the value of that key is stored in Vx.

            // Waiting means resetting the program counter to previous statement so on next
            // tick our command can be executed again.
            // On keypress, we exit it loop by not resetting the program counter.

            let cpu = aCPU({memory: new Uint8Array(0x200)})
            cpu.pc = 0x200

            releaseKey(cpu);
            tick(cpu)

            expect(cpu.pc).toEqual(0x200)
            expect(cpu.rs[0x1]).toEqual(0x00)

            tick(cpu)

            expect(cpu.pc).toEqual(0x200)
            expect(cpu.rs[0x1]).toEqual(0x00)

            pressKey(cpu, 0xf)
            tick(cpu)

            expect(cpu.pc).toEqual(0x202)
            expect(cpu.rs[0x1]).toEqual(0xf)

            function tick(cpu: CPU) {
                cpu.pc = cpu.pc + 2
                cpu.exec(new LD_Vx_K(0x1))
            }
        })
    })

    describe("LD DT, Vx", () => {
        test("Set delay timer = Vx", () => {
            let cpu = aCPU()
            cpu.rs[0x1] = 0xee
            cpu.exec(new LD_DT_Vx(0x1))
            expect(cpu.registerDT).toEqual(0xee)
        })
    })

    describe("LD ST, Vx", () => {
        test("Set sound timer = Vx", () => {
            let cpu = aCPU()
            cpu.rs[0x1] = 0xee
            cpu.exec(new LD_ST_Vx(0x1))
            expect(cpu.registerST).toEqual(0xee)
        })
    })

    describe("ADD I, Vx", () => {
        test("Set I = I + Vx", () => {
            let cpu = aCPU()
            cpu.registerI = 0x11ff
            cpu.rs[0x1] = 0xee
            cpu.exec(new ADD_I_Vx(0x1))
            expect(cpu.registerI).toEqual(0x12ed)

        })
    })

    describe("LD F, Vx", () => {
        test("Set I = location of sprite for digit Vx", () => {
            let cpu = aCPU()
            cpu.rs[0x1] = 0x0
            cpu.rs[0x2] = 0xf

            cpu.exec(new LD_F_Vx(0x1))
            expect(cpu.registerI).toEqual(0x000)

            cpu.exec(new LD_F_Vx(0x2))
            expect(cpu.registerI).toEqual(0x04b)
        })
    })

    describe("LD B, Vx", () => {
        test("Store BCD representation of Vx in memory locations I, I+1, and I+2", () => {
            let cpu = aCPU()
            cpu.registerI = 0x002
            cpu.rs[0x1] = 0xef // 239

            cpu.exec(new LD_B_Vx(0x1))

            expect(cpu.memory[0x002]).toEqual(2)
            expect(cpu.memory[0x003]).toEqual(3)
            expect(cpu.memory[0x004]).toEqual(9)


        })
    })

    describe("LD [I], Vx", () => {
        test("Store rs V0 through Vx in memory starting at location I", () => {

            let cpu = aCPU({memory: new Uint8Array(50)})
            new Array(16).fill(0).forEach((_, i) => cpu.rs[i] = 10 + i)

            cpu.registerI = 0x002
            cpu.exec(new LD_I_Vx(0x3))

            for (let i = 0; i <= 0x3; i++)
                expect(cpu.memory[i + 0x002]).toEqual(cpu.rs[i])

            // again another location
            cpu.registerI = 0x020
            cpu.exec(new LD_I_Vx(0xf))

            for (let i = 0; i <= 0xf; i++)
                expect(cpu.memory[i + 0x020]).toEqual(cpu.rs[i])
        })
    })

    describe("LD Vx, [I]", () => {
        test("Read rs V0 through Vx from memory starting at location I", () => {
            let cpu = aCPU({memory: new Uint8Array(50)})
            new Array(16).fill(0).forEach((_, i) => cpu.memory[0x002 + i] = 10 + i)

            cpu.registerI = 0x002
            cpu.exec(new LD_Vx_I(0x4))

            for (let i = 0; i <= 0x4; i++)
                expect(cpu.rs[i]).toEqual(cpu.memory[0x002 + i] = 10 + i)
        })
    })

    describe("print()", () => {
        test("asci prints the screen", () => {
           let cpu = aCPU({memory: new Uint8Array(0x200)})

            for (let i = IoManager.SCREEN_BASE_ADDRESS; i < IoManager.SCREEN_BASE_ADDRESS + IoManager.SCREEN_SIZE; i++)
                cpu.memory[i] = 0b10111101

            expect(print(cpu)).toMatchSnapshot()
        })

        test("should handle leading zeros well", () => {
            let cpu = aCPU({memory: new Uint8Array(0x200)})

            for (let i = IoManager.SCREEN_BASE_ADDRESS; i < IoManager.SCREEN_BASE_ADDRESS + IoManager.SCREEN_SIZE; i++)
                cpu.memory[i] = 0x1

            expect(print(cpu)).toMatchSnapshot()
        })
    })
})



function aCPU(opts: Partial<CpuOptions> = {}): CPU {
    let memory = new Uint8Array(10);
    let defaultOptions = {memory, programStart: 0, iom: new IoManager(opts.memory || memory, () => new NoOpIO())};
    let options = {...defaultOptions, ...opts}
    let cpu = new CPU(options)

    return cpu;
}

export function print(cpu: CPU): string {
    let output = ""
    let cursor = 0

    for (let i = IoManager.SCREEN_BASE_ADDRESS; i < IoManager.SCREEN_BASE_ADDRESS + IoManager.SCREEN_SIZE; i++) {
        if (cursor === 8) {
            output += "\n"
            cursor = 0
        }
        output += printByte(cpu.memory[i])
        cursor ++
    }

    return output

    function printByte(byte: Bit8): string {
        let output = ""

        for (let char of byte.toString(2).padStart(8, "0")) {
            output +=  (char === "1") ? "x" : " "
        }
        return output
    }

}

function pressKey(cpu: CPU, key: number) {
    cpu.memory[IoManager.KEY_VALUE] = key
    cpu.memory[IoManager.KEY_PRESSED] = 0xff
}

function releaseKey(cpu: CPU) {
    cpu.memory[IoManager.KEY_PRESSED] = 0x00
}

// @TODO move to test helper files
class NoOpIO implements IO {
    renderScreen(): void {
    }

    clearScreen(): void {
    }

    updatePixel(x: number, y: number, isOn: boolean): void {
    }

}