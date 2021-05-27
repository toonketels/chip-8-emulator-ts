import {CPU, CpuOptions, VM} from "../vm";
import {CALL, JP, SE_Vx_kk} from "../parse";



describe("Chip 8", () => {
    test("load and execute a program", () => {

        const vm = new VM()

        vm.start({cycles: 10})
        console.log("started")

        vm.stop()
        console.log("stop")
    })
})


