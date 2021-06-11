import {VM} from "../vm";
import path from "path";
import {print} from "./vm"
import {IO} from "../index";



describe("Chip 8", () => {

    test("test_opcode", async () => {
        let rom = path.resolve('../roms/TEST_OPCODE');

        const vm = new VM({rom, createIoDevice: () => new NoOpIO()})

        await vm.start({cycles: 200, cyclesPerFrame: 30})
        vm.stop()
        expect(print(vm.cpu)).toMatchSnapshot()
    })

    test("test i.chi8", async () => {
        let rom = path.resolve('../roms/i.ch8');

        const vm = new VM({rom, createIoDevice: () => new NoOpIO()})

        await vm.start({cycles: 100, cyclesPerFrame: 30})
        vm.stop()
        expect(print(vm.cpu)).toMatchSnapshot()
    })

    // @TODO reneable once we know which ones are deterministic
    test.skip.each([
        ["roms/TEST_OPCODE"],
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
        const vm = new VM({rom: `../${rom}`, createIoDevice: () => new NoOpIO()})

        vm.start({cycles: 1000})

        expect(print(vm.cpu)).toMatchSnapshot()
    })
})

class NoOpIO implements IO {
    renderScreen(): void {
    }

    clearScreen(): void {
    }

    updatePixel(x: number, y: number, isOn: boolean): void {
    }

}

