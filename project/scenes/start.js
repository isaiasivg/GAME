export class Start extends Phaser.Scene {

    // Constructor of the class
    constructor() {
        super({ key: 'start' });
    }

    // Preload method for loading assets before the scene starts
    preload() {
        this.load.image('startImage', 'images/start/menu.jpg');
        this.load.image('play_button', 'images/start/play.png');
    }

    // Create method for setting up the scene
    create() {
        // Background image
        this.add.image(750, 350, 'startImage').setScale(1500 / 4866, 700 / 3000);

        // Play button setup
        this.add.image(180, 515, 'play_button')
            .setOrigin(0, 0)
            .setScale(0.2, 0.2)
            .setInteractive()
            .on('pointerdown', () => {
                // When the play button is clicked, start the 'game' scene
                this.scene.start('game');
            });
    }
}
