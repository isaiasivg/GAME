export class Game extends Phaser.Scene {
    
    // Constructor of the class
    constructor() {
        super({ key: 'game' });

        this.map_number = 0;

        this.death = false;
        this.win = false;
        this.moving = false;

        this.y_Pos = 0;
        this.sequence = [];
    }

    // Preload method for loading assets before the scene starts
    preload() {
        this.load.image('map', 'images/game/map/board.png');
        this.load.image('spike', 'images/game/map/spike.png');
        this.load.image('rock', 'images/game/map/rock.png');
        this.load.image('right_map', 'images/game/map/right_map.png');

        this.load.spritesheet('guy', 'images/game/adventurer.png', {
            frameWidth: 50,
            frameHeight: 37,
            endFrame: 71
        });

        this.load.image('right', 'images/game/buttons/right_button.png');
        this.load.image('left', 'images/game/buttons/left_button.png');
        this.load.image('up', 'images/game/buttons/up_button.png');
        this.load.image('down', 'images/game/buttons/down_button.png');

        this.load.image('accept', 'images/game/buttons/accept_button.png');
        this.load.image('clear', 'images/game/buttons/clear_button.png');

        this.load.image('right_arrow', 'images/game/arrows/right_arrow.png');
        this.load.image('left_arrow', 'images/game/arrows/left_arrow.png');
        this.load.image('up_arrow', 'images/game/arrows/up_arrow.png');
        this.load.image('down_arrow', 'images/game/arrows/down_arrow.png');
    }

    // Create method for setting up the scene
    create() {
        // Create the game board
        this.createBoard();

        // Create the avatar sprite
        this.avatar = this.add.sprite(0, 0, 'guy')
            .setOrigin(0, 0)
            .setScale(233 / 50, 233 / 37);

        // Create animations for the avatar
        this.createAnims();

        // Create a group to manage the block sequence
        this.blockSequenceGroup = this.add.group();

        // Create buttons zone for dropping buttons
        this.createButtonsZone();

        // Create draggable move buttons
        this.createMoveButtons();

        // Create a play button
        this.createPlayButton();

        // Create a clear button
        this.createClearButton();
    }

    // Update method
    update() {
        // Check if the 'move' animation is not playing and the avatar is not in a death state
        if (!this.avatar.anims.isPlaying && this.death === false) {
            this.avatar.anims.play('idle', true);
        } else if (this.death === true) {
            // If the 'death' property is true, set the first frame and stop any ongoing animation
            this.avatar.setFrame(0);
            this.avatar.anims.stop(); // This stops any ongoing animation
        }

        // Call the checkGame() function to handle game state logic
        this.checkGame();
    }
   
    // Create the game board and display elements on the screen
    createBoard() {
        // Create the initial game board using the createMap function
        this.board = this.createMap();
        
        // Define the size of each game piece and the dimensions of the board
        const pieceSize = 233;
        const rows = this.board.length;
        const cols = this.board[0].length;
        
        // Add background images for the map
        this.add.image(0, 0, 'map').setOrigin(0, 0);
        this.add.image(934, 0, 'right_map').setOrigin(0, 0);

        // Iterate over the rows and columns of the board
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Check the value at the current position on the board
                if (this.board[r][c] === 1) {
                    // If the value is 1, add a 'spike' image at the corresponding position
                    this.add.image(c * pieceSize, r * pieceSize, 'spike')
                            .setOrigin(0, 0);
                } else if (this.board[r][c] === 2) {
                    // If the value is 2, add a 'rock' image at the corresponding position and update the goalMap
                    const img = this.add.image(c * pieceSize, r * pieceSize + 40, 'rock')
                                        .setOrigin(0, 0);

                    this.goalMap[r][c] = img;
                }
            }
        }
    }

    // Create animations for the 'guy' sprite
    createAnims() {
        // Create a 'move' animation
        this.anims.create({
            key: 'move', // Animation key
            frames: this.anims.generateFrameNumbers('guy', {
                start: 3,
                end: 13    
            }), 
            frameRate: 10, 
            repeat: 0 
        });

        // Create an 'idle' animation
        this.anims.create({
            key: 'idle', // Animation key
            frames: this.anims.generateFrameNumbers('guy', {
                start: 0,
                end: 3    
            }), 
            frameRate: 6, 
            repeat: -1 // Repeat the animation indefinitely 
        });
    }
  
    // Create draggable move buttons on the screen
    createMoveButtons() {
        // Create a group of buttons using specific keys and configurations
        this.buttons = this.add.group({
            key: ['right', 'up', 'down', 'left'], // Button keys
            setXY: { x: 1007, y: 625, stepX: 141 }, // Set initial positions and spacing
            setScale: { x: 141.5 / 158, y: 141.5 / 158 }, // Set scale for the buttons
            setOrigin: { x: 0, y: 0 }, 
        });

        // Iterate over the buttons and set interactivity
        this.buttons.children.iterate(button => {
            button.setInteractive({ draggable: true });

            // Save the initial position and the button key as buttonType
            button.initialX = button.x;
            button.initialY = button.y;
            button.buttonType = button.texture.key; // Assign the button key as buttonType

            // Event listener for the 'drag' event
            button.on('drag', (pointer, dragX, dragY) => {
                // Move the button based on mouse drag, but only if the game is not over and the avatar is not moving
                if (!this.death && !this.win && !this.moving) {
                    button.x = dragX;
                    button.y = dragY;
                }
            });

            // Event listener for the 'dragend' event
            button.on('dragend', () => {
                // Check if the button is over the drop zone 
                if (this.dropZone.getBounds().contains(button.x, button.y)) {
                    // Draw a block based on the button type
                    this.drawBlock(button.buttonType);
                }

                // Reset the button position to its original position
                button.x = button.initialX;
                button.y = button.initialY;
            });
        });
    }
      
    // Create a rectangular drop zone area
    createButtonsZone() {
        // Create a rectangular zone at a specific position (1050, 0) with dimensions 334x550
        this.dropZone = this.add.zone(1050, 0, 334, 550)
                                .setRectangleDropZone(334, 550) // Set the zone as a rectangular drop zone
                                .setOrigin(0, 0);
                                
        // Configure the drop zone to be interactive for drop events
        this.input.on('drop', (pointer, gameObject, dropZone) => {});
    }

    // Create a play button on the screen
    createPlayButton(){
        // Create an image with the 'accept' key
        this.add.image(934, 0, 'accept')
            .setOrigin(0, 0)
            .setScale(116 / 701, 116 / 701) // Scale the image
            .setInteractive() // Enable interactivity for the image
            .on('pointerdown', () => {
                // Check if the avatar is not currently moving
                if(!this.moving){
                    // Call the moveGuy() function when the pointer is down on the play button
                    this.moveGuy();
                }
            });
    }

    // Create a clear button on the screen
    createClearButton() {
        // Create an image with the 'clear' key
        this.add.image(1384, 0, 'clear')
            .setOrigin(0, 0)
            .setScale(116 / 701, 116 / 701) // Scale the image
            .setInteractive() // Enable interactivity for the image
            .on('pointerdown', () => {
                // Check if the avatar is not currently moving
                if (!this.moving) {
                    // Call the clearSequence() function when the pointer is down on the clear button
                    this.clearSequence();
                }
            });
    }

    // Draw a block of a specified type on the screen
    drawBlock(type) {
        // Check if the vertical position (y_Pos) is below a certain threshold (550)
        if (this.y_Pos < 550) {
            // Create the new image in the y_Pos
            const img = this.add.image(1050, this.y_Pos, type + '_arrow')
                                .setOrigin(0, 0);

            // Increment the vertical position by 55 units
            this.y_Pos += 55;

            // Add the type of the block to the sequence array
            this.sequence.push(type);

            // Add the created image to a group named 'blockSequenceGroup'
            this.blockSequenceGroup.add(img);
        }
    }

    // Process the next move in the sequence and move the avatar accordingly
    moveGuy() {
        // Check if there are moves left in the sequence
        if (this.sequence.length > 0) {
            // Set the 'moving' flag to true to indicate that the avatar is currently in motion
            this.moving = true;

            // Get the next move from the sequence and remove it from the sequence
            const move = this.sequence[0];
            this.sequence.shift();

            // Initialize variables to represent the movement in the x and y directions
            let x = 0;
            let y = 0;

            // Determine the direction of movement based on the current move
            switch (move) {
                case 'up':
                    y = -1;
                    break;
                case 'down':
                    y = 1;
                    break;
                case 'right':
                    x = 1;
                    break;
                case 'left':
                    x = -1;
                    break;
            }

            // Move the avatar based on the calculated x and y values
            this.moveAvatar(x, y);
        } else {
            // If there are no more moves in the sequence, clear the sequence and set the 'moving' flag to false
            this.clearSequence();
            this.moving = false;
        }
    }

    // Move the avatar by a specified amount in the x and y directions
    moveAvatar(x, y) {
        // Calculate the target position for the avatar based on the current position and the specified movement
        const targetX = this.avatar.x + x * 233;
        const targetY = this.avatar.y + y * 233;

        // Check if the target position is valid 
        if (this.in(targetX, 931) && this.in(targetY, 698)) {  
            // Play the 'move' animation for the avatar
            this.avatar.anims.play('move', true);

            // Use tweens to smoothly move the avatar to the target position over a duration of 500 milliseconds
            this.tweens.add({
                targets: this.avatar,
                x: targetX,
                y: targetY,
                duration: 500,
                ease: 'Linear',
                // Callback function to be executed upon tween completion
                onComplete: () => {
                    // Check if the move results in the avatar's death
                    if (!this.isfinishMove(targetX, targetY)) {
                        // If the move is not a winning move add a delay of 300 milliseconds before calling moveGuy recursively
                        if (!this.win) {
                            this.time.delayedCall(300, () => {
                                this.moveGuy();
                            });
                        } else {
                            // If the game is won, clear the sequence
                            this.clearSequence();
                        }
                    } else {
                        // If the move results in the avatar's death, set the 'death' flag to true and clear the sequence
                        this.death = true;
                        this.clearSequence();
                    }
                }
            });  
        } else {
            // If the movement is not valid call moveGuy 
            this.moveGuy(); 
        }
    }
    
    // Checks if the avatar dies with the current move and if the player wins
    isfinishMove(x, y) {
        // Convert pixel coordinates into columns and rows in the board matrix
        const r = y / 233;
        const c = x / 233;

        // Check the board matrix
        if (this.board[r][c] === 2) {
            // If the avatar reaches a goal (value 2 in the board matrix)
            // Hide the goal at the current position on the goalMap
            this.goalMap[r][c].visible = false;
            // Set the corresponding value in the goalMap to 0
            this.goalMap[r][c] = 0;

            // Decrease the goals count
            this.goals -= 1;

            // If there are no more goals remaining, set the 'win' flag to true
            if (this.goals === 0) {
                this.win = true;
            }

            // Indicate that the move does not result in the avatar's death
            return false;
        }

        // If the avatar encounters an obstacle (value 1 in the board matrix), indicate that the move results in the avatar's death
        if (this.board[r][c] === 1) {
            return true;
        }

        // Indicate that the move does not result in the avatar's death
        return false;
    }

    // Clear the move sequence and reset y_Pos
    clearSequence() {
        this.y_Pos = 0;
        this.sequence = [];
    
        if (this.blockSequenceGroup) {
            this.blockSequenceGroup.clear(true); 
        }
    }
    
    // Check if a given number is within 0 and a specified range
    in(n, max){
        if (n > max || n < 0){
            return false;
        }
        return true;
    }

    // Create and return a game map based on the current map_number
    // Initialize goalMap and goals variables
    createMap(){
        let map;

        switch (this.map_number) {
            case 0:
                map = [ 
                    [0, 1, 0, 0],
                    [2, 2, 1, 0],
                    [1, 0, 2, 0]
                ];
                break;
            case 1:
                map = [
                    [0, 0, 0, 0],
                    [1, 1, 1, 0],
                    [2, 2, 2, 0]
                ];
                break;
            case 2:
                map = [
                    [0, 0, 1, 0],
                    [0, 1, 2, 0],
                    [0, 2, 2, 1]
                ];
                break;
            case 3:
                map = [
                    [0, 0, 0, 2],
                    [1, 2, 1, 0],
                    [1, 0, 2, 0]
                ];
                break;
            case 4:
                map = [
                    [0, 2, 1, 2],
                    [2, 0, 1, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 5:
                map = [
                    [0, 2, 0, 0],
                    [2, 2, 1, 0],
                    [1, 0, 0, 0]
                ];
                break;
        }

        // I save the image info in this matrix
        this.goalMap = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        this.goals = 3;

        return map;
    }

    // Check the game state and initiate the restart scene accordingly
    checkGame() {
        // Check if the player has won
        if (this.win) {
            // If the player has won, delay the restart by 500 milliseconds
            this.time.delayedCall(500, () => {
                // Update the map number and reset the game
                this.map_number = (this.map_number + 1) % 5;
                this.resetGame();
                
                // Start the 'restart' scene with information about the game ending as a win (end: 1) and starting lives (starts: 3)
                this.scene.start('restart', { end: 1, starts: 3 });
            });
        } 
        // Check if the player has lost (died)
        else if (this.death) {
            // If the player has lost, delay the restart by 500 milliseconds
            this.time.delayedCall(500, () => {
                // Calculate the number of starting lives based on the goals achieved
                let starts = 3 - this.goals;
                
                // Reset the game and start the 'restart' scene with information about the game ending as a loss (end: 0) and starting lives
                this.resetGame();
                this.scene.start('restart', { end: 0, starts: starts });
            });
        }
    }

    // Reset game-related variables
    resetGame(){
        this.death = false;
        this.win = false;
        this.moving = false;  
    }    
}