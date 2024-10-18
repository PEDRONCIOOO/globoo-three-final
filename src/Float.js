import { Group, Clock } from "three";

export default class Float extends Group {
  constructor({
    speed = 1,
    floatIntensity = 1,
    rotationIntensity = 1
  } = {}) {
    super();

    this.group = new Group();
    const add = super.add.bind(this);
    add(this.group)

    this.enabled = true;
    this.speed = speed || 1;
    this.floatIntensity = floatIntensity || 1;
    this.rotationIntensity = rotationIntensity || 1;
    
    this.clock = new Clock();
  }

  add(...objects){
    this.group.add(...objects);
  }

  update() {
    if (!this.enabled || this.speed === 0) return;
    const t = this.clock.getElapsedTime();
    this.group.rotation.x = Math.cos(t / 4 * this.speed) / 8 * this.rotationIntensity;
    this.group.rotation.y = Math.sin(t / 4 * this.speed) / 8 * this.rotationIntensity;
    this.group.rotation.z = Math.sin(t / 4 * this.speed) / 20 * this.rotationIntensity;

    let yPosition = Math.sin(t / 4 * this.speed) / 10;
    this.group.position.y = yPosition * this.floatIntensity;
    this.group.updateMatrix();
  }
}