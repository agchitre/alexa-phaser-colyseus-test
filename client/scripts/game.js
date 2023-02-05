import MainScene from "./scenes/MainScene.js";

var config = {
    type: Phaser.AUTO,
    roundPixels: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth > window.innerHeight ? 1280 : 800,
        height: window.innerWidth > window.innerHeight ? 800 : 1280
    },
    pixelArt: false,
    scene: [MainScene]
}

var game = new Phaser.Game(config);