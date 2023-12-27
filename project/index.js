import { Start } from './scenes/start.js'
import { Game } from './scenes/game.js'
import { Restart } from './scenes/restart.js'

const config = {
    type: Phaser.AUTO,
    width: 1500, 
    height: 700,
    scene: [Start, Game, Restart],
}

var game = new Phaser.Game(config);