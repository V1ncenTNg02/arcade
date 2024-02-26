import Phaser from "phaser";
import Preloader from "./Preloader.js";
import Play from "./Play.js";
import Menu from "./Menu.js";
import UI from "./UI.js";

export const config = {
  title: "Tommy Jumping",
  type: Phaser.AUTO,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 2000,
      },
    },
  },
  // parent: "gameDisplay",
  // width: 640,
  // height: 360,
  scale: {
    parent: "gameDisplay",
    mode: Phaser.Scale.FIT,
    width: 640,
    height: 360,
  },
  // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
  scene: [Preloader, UI, Play, Menu],
};
