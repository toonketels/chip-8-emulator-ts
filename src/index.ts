import {VM} from "./vm";
import path from "path";
import {TerminalIO} from "./io";
import {CPU} from "./cpu";


main()

export function main() {

    // let rom = path.resolve('roms/IBM');
    // let rom = path.resolve('roms/chip8-test-rom.ch8');  // test ok

    // let rom = path.resolve('roms/15PUZZLE');   // not sure but renders
    // let rom = path.resolve('roms/BLINKY');   // issue rendering left side 1 pxl added
    // let rom = path.resolve('roms/BLITZ');   // immediately goes to game over

    // game: destroy the brix
    //       4  left
    //       5  stop
    //       6  right
    // issue: rendering, too fast, pauzes at some point
    // let rom = path.resolve('roms/BRIX');

    // game
    // issue: too fast
    // let rom = path.resolve('roms/CONNECT4');

    // game
    // issue: rendering
    // let rom = path.resolve('roms/GUESS');

    // game
    // issue: doesnt wait
    // let rom = path.resolve('roms/HIDDEN');

    let rom = path.resolve('roms/INVADERS');

    const vm = new VM({rom, io: (cpu: CPU) => new TerminalIO(cpu)})

    vm.start()

}