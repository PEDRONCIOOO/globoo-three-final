import { initScene } from "./src/scene";
import { initDropdownAnimation } from './src/dropdownAnimation.js';

onload = () => {
  initScene();
  initDropdownAnimation();
}