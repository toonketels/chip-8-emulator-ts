import {VM} from "./vm";


export function create() {

    const vm = new VM()

    vm.start()
    setTimeout(() => { vm.stop()}, 2000)

}