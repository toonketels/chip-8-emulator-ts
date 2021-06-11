import * as fs from "fs";
import {IO, IOOps} from "./io";
import {CPU} from "./cpu";
import {IoManager, VmIoManager} from "./ioManager";

interface StartOps {
    cycles?: number,
    cyclesPerFrame?: number,
}

export class VM {
    static size_4K: number = 4096
    private shouldStop = false
    private romPath: string
    private cycles = 0

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
    public memory: Uint8Array
    public iomm: VmIoManager
    public cpu: CPU

    constructor(ops: {rom: string, io: (iomm: IOOps) => IO}) {
        this.romPath = ops.rom
        this.memory = new Uint8Array(VM.size_4K)
        let iom =  new IoManager(this.memory, ops.io)
        this.cpu =new CPU({memory: this.memory, programStart: 0x200, iom: iom})
        this.iomm = iom
    }

    // Start the vm
    // flow:
    //  - initialize
    //  - loadRom
    //  - start executing instructions forever
    //  - till we get interrupt signal
    //  - should we run in a separate thread so we can easily stop it?
     public async start({cycles = Number.POSITIVE_INFINITY, cyclesPerFrame = 10}: StartOps = {}): Promise<void> {

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
        this.iomm.renderScreen()
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


