import Phaser from "phaser";
import Boot from "./Boot.js";
import Preloader from "./Preloader.js";
import MainMenu from "./MainMenu.js";
import MainGame from "./Game.js";

export const config = {
  title: "Snowman Defender",
  type: Phaser.AUTO,
  backgroundColor: "#3366b2",
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  // parent: "gameDisplay",
  // width: 1024,
  // height: 768,
  scale: {
    parent: "gameDisplay",
    mode: Phaser.Scale.FIT,
    width: 1024,
    height: 768,
  },
  // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
  scene: [Boot, Preloader, MainMenu, MainGame],
};
