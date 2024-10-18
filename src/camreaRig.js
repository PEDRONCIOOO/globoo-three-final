import { easing } from "maath";
import { pointer } from "./system/pointer";

function cameraRig(camera) {

    function update(delta) {
        easing.damp3(
            camera.rotation,
            [
                (-pointer.y * innerHeight * 0.5) / 32000,
                (pointer.x * innerWidth) / 32000,
                0
            ],
            0.5,
            delta
        )
    }

    return {
        update
    }
}

export { cameraRig };