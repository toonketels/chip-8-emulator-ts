import {VM} from "./vm";
import path from "path";
import {IOOps, TerminalIO} from "./io";


main()

export function main() {

    let rom = parseArguments(process.argv)

    const vm = new VM({rom, io: (ops: IOOps) => new TerminalIO(ops)})

    vm.start()

}


function parseArguments(argv: string[]): string {

    let filePath = argv[2]

    if (filePath === undefined) {
        help()
        process.exit(1)
    }

     return path.resolve(filePath);
}


function help() {

    console.log("CHIP-8 EMULATOR")
    console.log("")
    console.log("node index.js <path to rom>")
}