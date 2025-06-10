import { initScene } from "./src/scene";
import { initCursor } from "./src/system/cursor";
import { initServicesModal } from "./src/system/services-modal"
import { initCardsAnimation } from "./src/system/cards-animation";
import { initStatsAnimation } from "./src/system/stats-animation";

onload = () => {
  initScene();
  initCursor();
  initServicesModal();
  initCardsAnimation();
  initStatsAnimation();
}