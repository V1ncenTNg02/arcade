import Phaser from "phaser";
import Boot from "./Boot.js";
import Preloader from "./Preloader.js";
import MainMenu from "./MainMenu.js";
import MainGame from "./Game.js";

export const config = {
  title: "Escapae from Germs",
  type: Phaser.AUTO,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  // parent: "gameDisplay",
  // width: 800,
  // height: 600,
  scale: {
    parent: "gameDisplay",
    mode: Phaser.Scale.FIT,
    width: 800,
    height: 600,
  },
  // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
  scene: [Boot, Preloader, MainMenu, MainGame],
};
