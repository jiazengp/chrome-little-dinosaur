/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
export default class PlayScene extends Phaser.Scene {
  private ground!: Phaser.GameObjects.TileSprite
  private dino!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private startTriggle!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private obstricles!: Phaser.Physics.Arcade.Group
  private gameOverScreen!: Phaser.GameObjects.Container
  private gameOverText!: Phaser.GameObjects.Image
  private restart!: Phaser.GameObjects.Image
  private scoreText!: Phaser.GameObjects.Text
  private highScoreText!: Phaser.GameObjects.Text

  private jumpSound!: Phaser.Sound.BaseSound
  private hitSound!: Phaser.Sound.BaseSound
  private reachSound!: Phaser.Sound.BaseSound

  private gameSpeed: number
  private isGameRunning!: boolean
  private respawnTime: number

  private score = 0

  constructor() {
    super('PlayScene')
    this.gameSpeed = 10
    this.respawnTime = 0
    this.score = 0
  }

  create(): void {
    const { height, width } = this.game.config

    this.isGameRunning = false

    this.jumpSound = this.sound.add('jump', { volume: 0.5 })
    this.hitSound = this.sound.add('hit', { volume: 0.5 })
    this.reachSound = this.sound.add('reach', { volume: 0.5 })

    this.gameOverScreen = this.add
      .container((width as number) / 2, (height as number) / 2 - 50)
      .setAlpha(0)

    this.gameOverText = this.add.image(0, 0, 'game-over')
    this.restart = this.add.image(0, 80, 'restart').setInteractive()

    this.gameOverScreen.add([this.gameOverText, this.restart])

    this.startTriggle = this.physics.add
      .sprite(0, 10, null)
      .setOrigin(0, 1)
      .setImmovable()
      .setAlpha(0)

    this.ground = this.add
      .tileSprite(0, height as number, 88, 26, 'ground')
      .setOrigin(0, 1)

    this.dino = this.physics.add
      .sprite(1, height as number, 'dino-idle')
      .setCollideWorldBounds(true)
      .setGravityY(5000)
      .setBodySize(44, 92)
      .setOrigin(0, 1)

    this.scoreText = this.add
      .text(width as number, 0, '000000', {
        color: '#535353',
        fontSize: '900 35px Courier',
        resolution: 5,
      })
      .setOrigin(1, 0)

    this.highScoreText = this.add
      .text(0, 0, 'HI 000000', {
        color: '#535353',
        fontSize: '900 35px Courier',
        resolution: 5,
      })
      .setOrigin(1, 0)

    this.highScoreText.x = this.scoreText.x - this.scoreText.width - 20

    this.obstricles = this.physics.add.group()

    this.handleInputs()

    this.initAnimate()
    this.initStartTrigger()
    this.initColliders()
    this.handleScore()
  }

  handleScore() {
    this.time.addEvent({
      delay: 100,
      loop: true,
      callbackScope: this,
      callback: () => {
        if (!this.isGameRunning)
          return

        this.score++
        this.gameSpeed += 0.01

        if (this.score % 100 === 0) {
          this.reachSound.play()

          this.tweens.add({
            targets: this.scoreText,
            duration: 100,
            repeat: 3,
            props: {
              alpha: 0,
            },
            yoyo: true,
          })
        }

        const score = Array.from(String(this.score), Number)
        for (let i = 0; i < 5 - String(this.score).length; i++)
          score.unshift(0)

        this.scoreText.setText(score.join(''))
      },
    })
  }

  initColliders() {
    this.physics.add.collider(
      this.dino,
      this.obstricles,
      () => {
        console.log('碰撞')

        const highScore = this.highScoreText.text.split(' ')[1]
        console.log(highScore)
        const newScore
            = Number(this.scoreText.text) > Number(highScore)
              ? this.scoreText.text
              : highScore

        this.highScoreText.setText(`HI ${newScore}`)

        this.physics.pause()
        this.isGameRunning = false
        this.anims.pauseAll()
        this.dino.setTexture('dino-hurt')
        this.respawnTime = 0

        this.gameOverScreen.setAlpha(1)

        this.hitSound.play()
      },
      null,
      this,
    )
  }

  initStartTrigger() {
    const { width, height } = this.game.config

    this.physics.add.overlap(
      this.startTriggle,
      this.dino,
      () => {
        if (this.startTriggle.y === 10) {
          this.startTriggle.body.reset(0, height as number)
          this.startTriggle.disableBody(true, true)

          const startEvent = this.time.addEvent({
            delay: 10,
            loop: true,
            callbackScope: this,
            callback: () => {
              this.dino.setVelocityX(30)
              this.dino.play('dino-run-anim', true)

              if (this.ground.width < width)
                this.ground.width += 20

              if (this.ground.width >= width) {
                // @ts-expect-error
                this.ground.width = width

                this.isGameRunning = true
                this.dino.setVelocityX(0)
                startEvent.remove()
              }
            },
          })
        }
      },
      null,
      this,
    )
  }

  initAnimate() {
    this.anims.create({
      key: 'dino-run-anim',
      frames: this.anims.generateFrameNames('dino-run'),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'dino-down-anim',
      frames: this.anims.generateFrameNames('dino-down'),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'enemy-bird-anim',
      frames: this.anims.generateFrameNames('enemy-bird'),
      frameRate: 6,
      repeat: -1,
    })
  }

  placeObstricle() {
    const { width, height } = this.game.config
    const obstricleNum = Math.floor(Math.random() * 7) + 1

    const distance = Phaser.Math.Between(600, 900)

    let obstricle
    if (obstricleNum > 6) {
      const enemyHeight = [44, 66]
      obstricle = this.obstricles
        .create(
          (width as number) + distance,
          (height as number) - enemyHeight[Math.floor(Math.random() * 2)],
          'enemy-bird',
        )
        .setOrigin(0, 1)
      obstricle.body.height = obstricle.body.height / 1.5

      obstricle.play('enemy-bird-anim', true)
    }
    else {
      obstricle = this.obstricles
        .create(
          (width as number) + distance,
          height as number,
            `obsticle-${obstricleNum}`,
        )
        .setOrigin(0, 1)
    }
    obstricle.setImmovable()
  }

  handleInputs() {
    this.restart.on('pointerdown', () => {
      console.log('按下')
      this.dino.setVelocityY(0)
      // @ts-expect-error
      this.dino.body.height = 92
      this.dino.body.offset.y = 0
      this.physics.resume()
      this.obstricles.clear(true, true)
      this.isGameRunning = true
      this.gameOverScreen.setAlpha(0)
      this.anims.resumeAll()
      this.score = 0
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      console.log('空格')
      if (!this.dino.body.onFloor())
        return

      this.jumpSound.play()
      // @ts-expect-error
      this.dino.body.height = 92
      this.dino.body.offset.y = 0

      this.dino.setVelocityY(-1600)
    })

    this.input.keyboard.on('keydown-DOWN', () => {
      console.log('方向下')

      // @ts-expect-error
      this.dino.body.height = 58
      this.dino.body.offset.y = 34
    })

    this.input.keyboard.on('keyup-DOWN', () => {
      console.log('松开方向下')

      // @ts-expect-error
      this.dino.body.height = 92
      this.dino.body.offset.y = 0
    })
  }

  update(time: number, delta: number): void {
    if (!this.isGameRunning)
      return

    this.ground.tilePositionX += this.gameSpeed
    Phaser.Actions.IncX(this.obstricles.getChildren(), -this.gameSpeed)

    this.respawnTime += delta * this.gameSpeed

    if (this.respawnTime >= 15000) {
      this.placeObstricle()
      this.respawnTime = 0
    }

    this.obstricles.getChildren().forEach((obstricle) => {
      // @ts-expect-error
      if (obstricle.getBounds().right < 0) {
        this.obstricles.killAndHide(obstricle)
        console.log('释放资源')
      }
    })

    if (this.dino.body.deltaAbsY() > 0) {
      this.dino.anims.stop()
    }
    else {
      if (this.dino.body.height <= 58)
        this.dino.play('dino-down-anim', true)

      else
        this.dino.play('dino-run-anim', true)
    }
  }
}
