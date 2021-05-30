import {CPU, CpuOptions, VM} from "../vm";
import {CALL, JP, SE_Vx_kk} from "../parse";
import path from "path";
import {print} from "./vm"



describe("Chip 8", () => {

    test("test_opcode", () => {
        let rom = path.resolve('roms/TEST_OPCODE');

        const vm = new VM({rom})

        vm.start({cycles: 1000000})

        expect(print(vm.cpu)).toMatchSnapshot()

        vm.stop()
        console.log("stop")
    })

    test.each([
        ["roms/15PUZZLE"],
        ["roms/BLINKY"],
        ["roms/BLITZ"],
        ["roms/BRIX"],
        ["roms/CONNECT4"],
        ["roms/GUESS"],
        ["roms/HIDDEN"],
        ["roms/IBM"],
        ["roms/INVADERS"],
        ["roms/KALEID"],
        ["roms/MAZE"],
        ["roms/MERLIN"],
        ["roms/MISSILE"],
        ["roms/PONG"],
        ["roms/PONG2"],
        ["roms/PUZZLE"],
        ["roms/SYZYGY"],
        ["roms/TANK"],
        ["roms/TETRIS"],
        ["roms/TICTAC"],
        ["roms/UFO"],
        ["roms/VBRIX"],
        ["roms/VERS"],
        ["roms/WIPEOFF"]
    ])("executes the RON %s", (rom: string) => {
        const vm = new VM({rom})

        vm.start({cycles: 10000000})

        expect(print(vm.cpu)).toMatchSnapshot()

        // vm.stop()
    })
})


