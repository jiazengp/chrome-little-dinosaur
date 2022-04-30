import Phaser from 'phaser'
import PreloadScene from '~/game/scenes/PreloadScene'
import PlayScene from '~/game/scenes/PlayScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth - 120,
  height: 340,
  pixelArt: true,
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [PreloadScene, PlayScene],
}

function launch(containerId: string) {
  return new Phaser.Game({ ...config, parent: containerId })
}

export default launch
export { launch }
