export class Restart extends Phaser.Scene {

    // Constructor of the class
    constructor() {
        super({ key: 'restart' });
    }

    // Preload method for loading assets before the scene starts
    preload() {
        this.load.image('complete', 'images/restart/complete.jpg');
        this.load.image('0', 'images/restart/0start.jpg');
        this.load.image('1', 'images/restart/1start.jpg');
        this.load.image('2', 'images/restart/2start.jpg');

        this.load.image('play', 'images/restart/play.png');
        this.load.image('restart_b', 'images/restart/restart_b.png');
    }

    // Create method for setting up the scene

    /*
        Inside data variable we have end and starts.
        When end is 1 the player has win that map, 0 when he has lost.
        We use starts to know the number of objetives reached by the player before losing.
    */
    create(data) {
    
        // Check if the scene was reached after winning the map
        if (data.end === 1) {
            // Display 3 starts image
            this.add.image(750, 350, 'complete')
                .setScale(1500 / 4866, 700 / 3000);

            // Display the play button
            this.add.image(680, 320, 'play')
                .setOrigin(0, 0)
                .setScale(0.2, 0.2)
                .setInteractive()
                .on('pointerdown', () => {
                    this.scene.start('game');
                });

        } else {
            // Display different images based on the number of objetives
            switch (data.starts) {
                case 0:
                    this.add.image(750, 350, '0')
                        .setScale(1500 / 4866, 700 / 3000);
                    break;
                case 1:
                    this.add.image(750, 350, '1')
                        .setScale(1500 / 4866, 700 / 3000);
                    break;
                case 2:
                    this.add.image(750, 350, '2')
                        .setScale(1500 / 4866, 700 / 3000);
                    break;
            }

            // Display the restart button
            this.add.image(550, 400, 'restart_b')
                .setOrigin(0, 0)
                .setScale(0.5, 0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.scene.start('game');
                });
        }
    } 
}
