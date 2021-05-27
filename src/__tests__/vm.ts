import {
    ADD_Vx_kk,
    ADD_Vx_Vy,
    AND,
    CALL,
    JP,
    LD_Vx_kk,
    LD_Vx_Vy,
    OR,
    SE_Vx_kk,
    SE_Vx_Vy,
    SHR,
    SNE,
    SUB,
    XOR
} from "../parse";
import {CPU, CpuOptions} from "../vm";

describe("exec", () => {

    describe("CLS", () => {
        test.skip("Clear the display", () => {
        })
    })

    describe("RET", () => {
        test.skip("Return from a subroutine.", () => {
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

    describe("SNE Vx, byte", () => {
        test("Skip next instruction if Vx != kk", () => {
            let cpu = aCPU({programStart: 0x200})
            cpu.rs[5] = 0x9

            cpu.exec(new SNE(5, 0x9))
            expect(cpu.pc).toEqual(0x200)

            cpu.exec(new SNE(5, 0x0))
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
            expect(cpu.rs[15]).toEqual(0x00)

            // now the borrow is set
            cpu.exec(new SUB(0x1, 0x2))
            expect(cpu.rs[1]).toEqual(0xff)
            expect(cpu.rs[15]).toEqual(0x01)

            // subtract from itself should be 0
            cpu.exec(new SUB(0x1, 0x1))
            expect(cpu.rs[1]).toEqual(0x00)
            expect(cpu.rs[15]).toEqual(0x00)

            // subtract biggest number from 0
            cpu.exec(new SUB(0x1, 0x3))
            expect(cpu.rs[1]).toEqual(0x01)
            expect(cpu.rs[15]).toEqual(0x01)
        })
    })

    describe("SUBN Vx, Vy", () => {
        test("Set Vx = Vy - Vx, set VF = NOT borrow", () => {
            // If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.

            throw new Error("TODO")
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

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })

    describe("", () => {
        test.skip("", () => {
        })
    })
})


function aCPU(opts: Partial<CpuOptions> = {}): CPU {
    let defaultOptions = {memory: new Uint8Array(10), stack: new Uint16Array(16), programStart: 0};
    let options = {...defaultOptions, ...opts}
    let cpu = new CPU(options)

    return cpu;
}