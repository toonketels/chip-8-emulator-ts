import * as fs from "fs";
import {IO} from "./io";
import {CPU} from "./cpu";

interface StartOps {
    cycles: number,
    cyclesPerFrame?: number,
}

export class VM {
    private static size_4K: number = 4096
    private static size_stack: number = 16
    private shouldStop = false
    private romPath: string
    private cycles = 0

    private io: IO

    // An array of 16 16-bit values
    // used to store the address that the interpreter shoud return to when finished with a subroutine.
    // Chip-8 allows for start to 16 levels of nested subroutines.
    public stack = new Uint16Array(VM.size_stack)

    // 4KB RAM, from location 0x000 (0) to 0xFFF (4095)
    //
    // 0x000  (0)
    //               512 bytes for original interpreter was located, and should not be used by programs
    // 0x1FF  (511)
    // 0x200  (512) Start of most Chip-8 programs
    //
    // 0x600 (1536) Start of ETI 660 Chip-8 programs
    //
    //              Chip-8 program/data space
    //
    // 0xFFF (4095)  End of Chip-8 RAM
    public memory = new Uint8Array(VM.size_4K)
    public cpu = new CPU({memory: this.memory, stack: this.stack, programStart: 0x200})

    constructor(ops: {rom: string, io: (cpu: CPU) => IO}) {
        this.romPath = ops.rom
        this.io = ops.io(this.cpu)
    }

    // @TODO input
    // @TODO output


    // Start the vm
    // flow:
    //  - initialize
    //  - loadRom
    //  - start executing instructions forever
    //  - till we get interrupt signal
    //  - should we run in a separate thread so we can easily stop it?
     public async start({cycles, cyclesPerFrame = 10}: StartOps): Promise<void> {

        return new Promise(function(this: VM, resolve: () => void) {
            this.loadRom()
            this.cpu.initialize()

            // @TODO 30 / 60 fps
            let cancel = setInterval(function(this: VM) {

                if (!(this.shouldStop || this.cycles > cycles)) {

                    for (let i = 0; i < cyclesPerFrame; i++) {
                        this.cpu.tick()
                        this.cycles++
                    }

                    // only render screen every 15 ms ticks
                    this.updateScreen()
                    this.checkInput()
                } else {
                    clearInterval(cancel)
                    resolve()
                }



            }.bind(this), 15);
        }.bind(this))
    }

    // Shut down the system
    public stop() {
        this.shouldStop = true
    }

    private updateScreen() {
        this.io.renderScreen()
    }

    private checkInput() {
        // @TODO
    }

    private loadRom() {

        // @TODO load directly into memory
        let fd = fs.openSync(this.romPath, 'r')
        let result = fs.readFileSync(fd)

        for (let i = 0; i < result.length; i++) {
            this.memory[0x200 + i] = result[i]
        }
    }
}


