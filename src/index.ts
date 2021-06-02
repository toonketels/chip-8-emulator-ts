import {CPU, VM} from "./vm";
import path from "path";
import {TerminalIO} from "./io";


main()

export function main() {

    let rom = path.resolve('roms/IBM');
    // let r`om = path.resolve('roms/chip8-test-rom.ch8');
    const vm = new VM({rom, io: (cpu: CPU) => new TerminalIO(cpu)})

    vm.start({cycles: 2000000})

}