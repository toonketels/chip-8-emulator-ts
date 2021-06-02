import {CPU, VM} from "./vm";
import path from "path";
import {TerminalIO} from "./io";


main()

export function main() {

    let rom = path.resolve('roms/person.ch8');
    const vm = new VM({rom, io: (cpu: CPU) => new TerminalIO(cpu)})

    vm.start({cycles: 20000})

}