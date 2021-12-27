<template>
  <div>
    <canvas id="canvas"></canvas>
    <div id="lottery-box">
      <div id="title-box" class="center-block">
        <p class="title">Plus Water 2021 Christmas Lottery</p>
        <p class="title">剩余：{{candidates.length}}</p>
      </div>
      <div id="input-box">
        <b-form inline id="input-form" @submit="onSubmit">
          <label class="sr-only" for="prize">prize</label>
          <b-form-input id="prize" placeholder="奖品" class="mb-2 mr-sm-2 mb-sm-0" v-model="form.prize"></b-form-input>
          <label class="sr-only" for="number">人数</label>
          <b-form-spinbutton prepend="x" id="number" :formatter-fn="dayFormatter" class="mb-2 mr-sm-2 mb-sm-0" vertical v-model="form.count" :max="candidates.length"></b-form-spinbutton>
          <b-button id="execute" variant="danger" type="submit" class="mb-2 mr-sm-2 mb-sm-0">{{action_title}}</b-button>
        </b-form>
      </div>
      <div id="name-list-box" class="mt-2">
        <b-list-group>
          <b-list-group-item v-for="winner in winner_list" :key="winner">{{winner}}</b-list-group-item>
        </b-list-group>
      </div>
      <div id="result-button-box" v-if="has_result" class="mt-2">
        <b-button id="result-button" variant="danger" v-b-toggle.results-display>显示/隐藏中奖名单</b-button>
      </div>
    </div>
    <b-sidebar id="results-display" title="中奖名单" shadow>
      <b-card bg-variant="danger" text-variant="light" v-for="(archivedList, archivedPrize) in winner_archive" :key="archivedPrize" :header="archivedPrize" class="text-center mt-2 ml-2 mr-2">
        <b-row v-for="n in separateLine(archivedList)" :key="n">
          <b-col v-for="name in separateColumn(n, archivedList)" :key="name">{{name}}</b-col>
        </b-row>
      </b-card>
      <template #footer="">
       <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
        <strong class="mr-auto">再抽一些</strong>
        <b-button id='reset-button' size="sm" v-on:click='resetCandidates'>重置名单</b-button>
       </div>
      </template>
    </b-sidebar>
    <b-tooltip target="reset-button" triggers="hover">
      重置名单会将已中奖的群友添加回奖池，该操作不会清除已有抽奖结果。清除结果请刷新。
    </b-tooltip>
  </div>
</template>

<style>
.selector-for-some-widget {
  box-sizing: content-box;
}

#lottery-box {
  position: absolute;
  left:50%;
  top: 10%;
  transform: translate(-50%, 0%);
}

.title {
  text-align: center;
}

.b-sidebar {
  width: 400px;
}

#canvas {
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: auto;
}
</style>

<script>
export default {
  name: 'spin',
  data () {
    return {
      candidates: [
        '夜老师',
        'wxs',
        'dsz',
        '耶梦加得',
        '粥粥',
        '葱哥',
        '茶几',
        '森井飞鸟',
        '阿姨',
        'yumi',
        '小风',
        'kbx',
        '晓哥哥',
        'AR',
        '霜老师',
        '高登',
        '团老师',
        'Rejur',
        '塞尔提',
        '七御',
        '灵魂的徘徊',
        '七姐'
      ],
      candidatesBackup: [],
      form: {
        prize: '',
        count: 1
      },
      show: true,
      started: false,
      has_result: false,
      shoot: -1,
      action_title: this.started ? '停！' : '抽！',
      winner_list: [],
      winner_archive: {},
      confettiSpriteIds: [],
      confettiSprites: {},
      canvas: 1,
      ctx: 1
    }
  },
  methods: {
    addKeyListPair (key, count, list) {
      if (!this.winner_archive.hasOwnProperty(key)) {
        this.winner_archive[key] = list
      } else if (!this.winner_archive.hasOwnProperty(key + ' - ' + count)) {
        this.winner_archive[key + ' - ' + count] = list
      } else {
        count++
        this.addKeyListPair(key, count, list)
      }
    },

    onSubmit (event) {
      this.started = !this.started
      this.action_title = this.started ? '停！' : '抽！'

      if (this.started) { // when start
        this.winner_list.splice(0)
        for (let index = 0; index < this.form.count; index++) {
          this.winner_list.push(this.candidates[index])
        }
        this.randomList()
      } else { // when stop
        if (this.form.count === 0) {
          return
        }
        this.has_result = true
        this.shoot = 0
        let tempList = []
        for (var name in this.winner_list) {
          this.candidates.splice(this.candidates.indexOf(name), 1)
        }
        if (this.form.count > this.candidates.length) {
          this.form.count = this.candidates.length
        }
        Object.assign(tempList, this.winner_list)
        this.addKeyListPair(this.form.prize === '' ? '奖品' : this.form.prize, 1, tempList)
      }
    },

    dayFormatter (value) {
      return 'x ' + value
    },

    randomList () {
      if (this.started) {
        var randomSeeds = []
        while (randomSeeds.length < this.winner_list.length) {
          var temp = parseInt(Math.random() * this.candidates.length)
          if (randomSeeds.indexOf(temp) === -1) {
            randomSeeds.push(temp)
          }
        }

        this.winner_list.splice(0)
        for (let index = 0; index < this.form.count; index++) {
          this.winner_list.push(this.candidates[randomSeeds[index]])
        }
        setTimeout(this.randomList, 50)
      }
    },

    setCanvasSize (canvas, dpr) {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    },

    addConfettiParticles (amount, angle, velocity, x, y, dpr) {
      let i = 0
      while (i < amount) {
        // sprite
        const r = this._.random(4, 6) * dpr
        const d = this._.random(15, 25) * dpr

        const cr = this._.random(50, 255)
        const cg = this._.random(50, 200)
        const cb = this._.random(50, 200)
        const color = `rgb(${cr}, ${cg}, ${cb})`

        const tilt = this._.random(10, -10)
        const tiltAngleIncremental = this._.random(0.07, 0.05)
        const tiltAngle = 0

        const id = this._.uniqueId()
        const sprite = {
          [id]: {
            angle,
            velocity,
            x,
            y,
            r,
            d,
            color,
            tilt,
            tiltAngleIncremental,
            tiltAngle
          }
        }

        Object.assign(this.confettiSprites, sprite)
        this.confettiSpriteIds.push(id)
        this.tweenConfettiParticle(id)
        i++
      }
    },

    tweenConfettiParticle (id) {
      const DECAY = 4
      const SPREAD = 50
      const GRAVITY = 1200

      const minAngle = this.confettiSprites[id].angle - SPREAD / 2
      const maxAngle = this.confettiSprites[id].angle + SPREAD / 2

      const minVelocity = this.confettiSprites[id].velocity / 4
      const maxVelocity = this.confettiSprites[id].velocity

      // Physics Props
      const velocity = this._.random(minVelocity, maxVelocity)
      const angle = this._.random(minAngle, maxAngle)
      const gravity = GRAVITY
      // const friction = this._.random(0.1, 0.25)
      const friction = this._.random(0.01, 0.05)
      const d = 0

      this.TweenLite.to(this.confettiSprites[id], DECAY, {
        physics2D: {
          velocity,
          angle,
          gravity,
          friction
        },
        d,
        ease: this.Power4.easeIn,
        onComplete: () => {
          // remove confetti sprite and id
          this._.pull(this.confettiSpriteIds, id)
          delete this.confettiSprites[id]
        }
      })
    },

    updateConfettiParticle (id) {
      const sprite = this.confettiSprites[id]

      const tiltAngle = 0.0005 * sprite.d

      sprite.angle += 0.01
      sprite.tiltAngle += tiltAngle
      sprite.tiltAngle += sprite.tiltAngleIncremental
      sprite.tilt = (Math.sin(sprite.tiltAngle - (sprite.r / 2))) * sprite.r * 2
      sprite.y += Math.sin(sprite.angle + sprite.r / 2) * 2
      sprite.x += Math.cos(sprite.angle) / 2
    },

    drawConfetti (ctx) {
      this.confettiSpriteIds.map(id => {
        const sprite = this.confettiSprites[id]

        ctx.beginPath()
        ctx.lineWidth = sprite.d / 2
        ctx.strokeStyle = sprite.color
        ctx.moveTo(sprite.x + sprite.tilt + sprite.r, sprite.y)
        ctx.lineTo(sprite.x + sprite.tilt, sprite.y + sprite.tilt + sprite.r)
        ctx.stroke()

        this.updateConfettiParticle(id)
      })
    },

    render () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.drawConfetti(this.ctx)
    },

    shootConfetti (canvas, dpr) {
      requestAnimationFrame(this.shootConfetti)
      if (this.shoot > -1 && this.shoot < 30) {
        this.shoot++
        this.addConfettiParticles(10, 270, 5000, canvas.width * 0.9, canvas.height * 0.9, dpr)
      }
    },

    setupListeners () {
      this.TweenLite.ticker.addEventListener('tick', this.render)
    },

    stopShoot () {
      this.shoot = false
    },

    resetCandidates () {
      this.candidates.splice(0)
      Object.assign(this.candidates, this.candidatesBackup)
    },

    separateLine (inputList) {
      return parseInt(inputList.length / 3) + 1
    },

    separateColumn (lineIndex, inputList) {
      let arr = []
      arr.push(inputList[(lineIndex - 1) * 3])
      arr.push(inputList[(lineIndex - 1) * 3 + 1])
      arr.push(inputList[(lineIndex - 1) * 3 + 2])
      return arr
    }
  },

  mounted () {
    Object.assign(this.candidatesBackup, this.candidates)
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    this.canvas = canvas
    this.ctx = ctx

    let dpr = window.devicePixelRatio || 1

    ctx.scale(dpr, dpr)
    this.setupListeners()

    this.setCanvasSize(canvas, dpr)
    this.shootConfetti(canvas, dpr)
  }
}
</script>
