import {
    ADD_Vx_kk, ADD_Vx_Vy, AND,
    CALL,
    CLS,
    DRW,
    JP, JP0, LD_Vx_kk, LD_Vx_DT, LD_I_nnn, LD_Vx_K, LD_Vx_Vy,
    Opcode, OR,
    decode,
    RET, RND,
    SE_Vx_kk,
    SE_Vx_Vy, SHL, SHR, SKNP, SKP,
    SNE_Vx_kk,
    SNE_Vx_Vy,
    split4Bit4,
    findValue,
    findAddress, SUB, SUBN, XOR, LD_DT_Vx, LD_ST_Vx, ADD_I_Vx, LD_F_Vx, LD_B_Vx, LD_I_Vx, LD_Vx_I
} from "../decode";
import {Bit12, Bit16, Bit4, Bit8} from "../types";

describe("decode()", () => {

    test.each([
        [0x00E0, new CLS()],
        [0x00EE, new RET()],
        [0x1000, new JP(0x000)],
        [0x112f, new JP(0x12f)],
        [0x2000, new CALL(0x000)],
        [0x20ff, new CALL(0x0ff)],
        [0x3000, new SE_Vx_kk(0x0, 0x00)],
        [0x312f, new SE_Vx_kk(0x1 , 0x2f)],
        [0x4000, new SNE_Vx_kk(0x0, 0x00)],
        [0x412f, new SNE_Vx_kk(0x1 , 0x2f)],
        [0x5000, new SE_Vx_Vy(0x0, 0x0)],
        [0x5120, new SE_Vx_Vy(0x1 , 0x2)],
        [0x6ecf, new LD_Vx_kk(0xe, 0xcf)],
        [0x612f, new LD_Vx_kk(0x1 , 0x2f)],
        [0x7ecf, new ADD_Vx_kk(0xe, 0xcf)],
        [0x712f, new ADD_Vx_kk(0x1 , 0x2f)],
        [0x8ec0, new LD_Vx_Vy(0xe, 0xc)],
        [0x8120, new LD_Vx_Vy(0x1 , 0x2)],
        [0x8ec1, new OR(0xe, 0xc)],
        [0x8121, new OR(0x1 , 0x2)],
        [0x8ec2, new AND(0xe, 0xc)],
        [0x8122, new AND(0x1 , 0x2)],
        [0x8ec3, new XOR(0xe, 0xc)],
        [0x8123, new XOR(0x1 , 0x2)],
        [0x8ec4, new ADD_Vx_Vy(0xe, 0xc)],
        [0x8124, new ADD_Vx_Vy(0x1 , 0x2)],
        [0x8ec5, new SUB(0xe, 0xc)],
        [0x8125, new SUB(0x1 , 0x2)],
        [0x8ec6, new SHR(0xe)],
        [0x8126, new SHR(0x1)],
        [0x8ec7, new SUBN(0xe, 0xc)],
        [0x8127, new SUBN(0x1 , 0x2)],
        [0x8ece, new SHL(0xe)],
        [0x812e, new SHL(0x1)],
        [0x9ec0, new SNE_Vx_Vy(0xe, 0xc)],
        [0x9120, new SNE_Vx_Vy(0x1 , 0x2)],
        [0xa000, new LD_I_nnn(0x000)],
        [0xa12f, new LD_I_nnn(0x12f)],
        [0xb000, new JP0(0x000)],
        [0xb12f, new JP0(0x12f)],
        [0xc103, new RND(0x1, 0x03)],
        [0xce2f, new RND(0xe, 0x2f)],
        [0xd103, new DRW(0x1, 0x0, 0x3)],
        [0xde2f, new DRW(0xe, 0x2, 0xf)],
        [0xe19e, new SKP(0x1)],
        [0xee9e, new SKP(0xe)],
        [0xe1a1, new SKNP(0x1)],
        [0xeea1, new SKNP(0xe)],
        [0xf107, new LD_Vx_DT(0x1)],
        [0xfe07, new LD_Vx_DT(0xe)],
        [0xf10a, new LD_Vx_K(0x1)],
        [0xfe0a, new LD_Vx_K(0xe)],
        [0xf115, new LD_DT_Vx(0x1)],
        [0xfe15, new LD_DT_Vx(0xe)],
        [0xf118, new LD_ST_Vx(0x1)],
        [0xfe18, new LD_ST_Vx(0xe)],
        [0xf11e, new ADD_I_Vx(0x1)],
        [0xfe1e, new ADD_I_Vx(0xe)],
        [0xf129, new LD_F_Vx(0x1)],
        [0xfe29, new LD_F_Vx(0xe)],
        [0xf133, new LD_B_Vx(0x1)],
        [0xfe33, new LD_B_Vx(0xe)],
        [0xf155, new LD_I_Vx(0x1)],
        [0xfe55, new LD_I_Vx(0xe)],
        [0xf165, new LD_Vx_I(0x1)],
        [0xfe65, new LD_Vx_I(0xe)],
    ])("binary %s is opcode %s", (binary: Bit16, opcode: Opcode) => {

        expect(decode(binary)).toBeInstanceOf(opcode.constructor)
        expect(decode(binary)).toMatchObject(opcode)
    })

    test.each([
        [0x00EA],
        [0x5121],
        [0x80Ef],
        [0x9111],
        [0xE19F],
        [0xE1A2],
        [0xF108],
    ])("will throw for unkown upcode %s", (binary: Bit16) => {
        expect(() => {
            let r = decode(binary)
        }
    ).toThrowError(`Parse error: unknown opcode ${binary.toString(16)}`)
    })

})

describe("findAddress()", () => {

    test.each([
        [0x1000, 0x000],
        [0x112f, 0x12f],
        [0x2000, 0x000],
        [0x20ff, 0x0ff],
    ])("splits binary %s to %s and %s", (binary: Bit16, address: Bit12) => {

        expect(findAddress(binary)).toEqual(address)
    })
})

describe("findValue()", () => {

    test.each([
        [0x3000, 0x00],
        [0x412f, 0x2f]
    ])("from binary %s finds value %s", (binary: Bit16, value: Bit8) => {

        expect(findValue(binary)).toEqual(value)
    })
})

describe("split4Bit4()", () => {

    test.each([
        [0x3000, 0x3, 0x0, 0x0, 0x0],
        [0x412f, 0x4, 0x1, 0x2, 0xf]
    ])("splits binary %s to %s, %s 5s, and %s", (binary: Bit16, a: Bit4, b: Bit4, c: Bit4, d: Bit4) => {

        expect(split4Bit4(binary)).toEqual([a, b, c, d])
    })
})