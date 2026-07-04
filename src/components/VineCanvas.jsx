import { useRef, useEffect, memo } from 'react'
import * as THREE from 'three'

const VINE_COLORS = [0xb0bda3, 0x9fae90, 0xc5a572]
const LEAF_COLORS = [0xb0bda3, 0xd0d9c8, 0xc4bac2]
const BLOSSOM_COLOR = 0xe5c1ca

function makeLeafTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.translate(size / 2, size / 2)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.beginPath()
  // Leaf: pointed at both ends
  ctx.moveTo(0, -size * 0.44)
  ctx.bezierCurveTo(size * 0.3, -size * 0.16, size * 0.3, size * 0.16, 0, size * 0.44)
  ctx.bezierCurveTo(-size * 0.3, size * 0.16, -size * 0.3, -size * 0.16, 0, -size * 0.44)
  ctx.fill()
  // Midrib
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.36)
  ctx.lineTo(0, size * 0.36)
  ctx.stroke()
  return new THREE.CanvasTexture(canvas)
}

function smoothstep(x) {
  const t = THREE.MathUtils.clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

function buildVine(viewW, viewH, leafTexture, leafGeometry, blossomGeometry, isSmall) {
  const group = new THREE.Group()

  // Anchor on a random screen edge, heading inward
  const edge = Math.floor(Math.random() * 4)
  let x, y, heading
  if (edge === 0) {
    x = (Math.random() - 0.5) * viewW * 0.9
    y = -viewH * 0.52
    heading = Math.PI / 2 + (Math.random() - 0.5) * 0.8
  } else if (edge === 1) {
    x = (Math.random() - 0.5) * viewW * 0.9
    y = viewH * 0.52
    heading = -Math.PI / 2 + (Math.random() - 0.5) * 0.8
  } else if (edge === 2) {
    x = -viewW * 0.52
    y = (Math.random() - 0.5) * viewH * 0.9
    heading = (Math.random() - 0.5) * 0.8
  } else {
    x = viewW * 0.52
    y = (Math.random() - 0.5) * viewH * 0.9
    heading = Math.PI + (Math.random() - 0.5) * 0.8
  }

  // Meandering walk with drifting curvature — gentle curls
  const points = []
  let curvature = (Math.random() - 0.5) * 0.5
  const steps = 13 + Math.floor(Math.random() * 5)
  const stepLen = Math.min(viewW, viewH) * (0.05 + Math.random() * 0.035)
  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, y, (Math.random() - 0.5) * 20))
    x = THREE.MathUtils.clamp(
      x + Math.cos(heading) * stepLen,
      -viewW * 0.55,
      viewW * 0.55
    )
    y = THREE.MathUtils.clamp(
      y + Math.sin(heading) * stepLen,
      -viewH * 0.55,
      viewH * 0.55
    )
    heading += curvature
    curvature = THREE.MathUtils.clamp(
      curvature + (Math.random() - 0.5) * 0.25,
      -0.6,
      0.6
    )
  }

  const curve = new THREE.CatmullRomCurve3(points)
  const stemGeometry = new THREE.TubeGeometry(curve, 180, 1.0, 5, false)
  const stemMaterial = new THREE.MeshBasicMaterial({
    color: VINE_COLORS[Math.floor(Math.random() * VINE_COLORS.length)],
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const stem = new THREE.Mesh(stemGeometry, stemMaterial)
  const totalIndex = stemGeometry.index.count
  stemGeometry.setDrawRange(0, 0)
  group.add(stem)

  // Leaves sprouting along the stem, plus a few blush blossoms
  const sprouts = []
  const leafCount = isSmall ? 7 : 11
  for (let i = 0; i < leafCount; i++) {
    const t = 0.12 + (i / leafCount) * 0.82 + Math.random() * 0.04
    const isBlossom = Math.random() < 0.22
    const material = new THREE.MeshBasicMaterial({
      map: isBlossom ? null : leafTexture,
      color: isBlossom
        ? BLOSSOM_COLOR
        : LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const sprout = new THREE.Mesh(
      isBlossom ? blossomGeometry : leafGeometry,
      material
    )
    sprout.position.copy(curve.getPoint(t))
    const tangent = curve.getTangent(t)
    const side = Math.random() < 0.5 ? 1 : -1
    sprout.rotation.z = Math.atan2(tangent.y, tangent.x) + (side * Math.PI) / 3
    sprout.rotation.x = (Math.random() - 0.5) * 0.7
    sprout.userData = {
      t,
      targetScale: isBlossom
        ? 0.35 + Math.random() * 0.25
        : 0.55 + Math.random() * 0.45,
      targetOpacity: isBlossom ? 0.5 : 0.42,
      swayPhase: Math.random() * Math.PI * 2,
    }
    sprout.scale.setScalar(0.001)
    group.add(sprout)
    sprouts.push(sprout)
  }

  return {
    group,
    stem,
    totalIndex,
    sprouts,
    stemOpacity: 0.4 + Math.random() * 0.12,
    time: -Math.random() * 4, // stagger start
    growDuration: 20 + Math.random() * 12,
    holdDuration: 12 + Math.random() * 8,
    fadeDuration: 5,
  }
}

function disposeVine(vine, scene) {
  scene.remove(vine.group)
  vine.stem.geometry.dispose()
  vine.stem.material.dispose()
  vine.sprouts.forEach((s) => s.material.dispose())
}

function VineCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const isSmall = window.innerWidth < 768
    const VINE_COUNT = isSmall ? 4 : 6

    let width = window.innerWidth
    let height = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000)
    camera.position.z = 400

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    let viewW = viewH * camera.aspect

    const leafTexture = makeLeafTexture()
    const leafGeometry = new THREE.PlaneGeometry(11, 17)
    const blossomGeometry = new THREE.CircleGeometry(6, 16)

    let vines = []
    for (let i = 0; i < VINE_COUNT; i++) {
      const vine = buildVine(viewW, viewH, leafTexture, leafGeometry, blossomGeometry, isSmall)
      // Scatter initial progress so the page never looks bare
      vine.time += (i / VINE_COUNT) * vine.growDuration * 0.8
      scene.add(vine.group)
      vines.push(vine)
    }

    const clock = new THREE.Clock()
    let rafId

    function updateVine(vine, dt, elapsed) {
      vine.time += dt
      const { growDuration, holdDuration, fadeDuration } = vine
      const t = vine.time
      let fade = 1
      let progress

      if (t < 0) {
        progress = 0
      } else if (t < growDuration) {
        progress = smoothstep(t / growDuration)
      } else if (t < growDuration + holdDuration) {
        progress = 1
      } else if (t < growDuration + holdDuration + fadeDuration) {
        progress = 1
        fade = 1 - smoothstep((t - growDuration - holdDuration) / fadeDuration)
      } else {
        // Regrow a fresh vine in its place
        disposeVine(vine, scene)
        const fresh = buildVine(viewW, viewH, leafTexture, leafGeometry, blossomGeometry, isSmall)
        scene.add(fresh.group)
        return fresh
      }

      vine.stem.geometry.setDrawRange(0, Math.floor(progress * vine.totalIndex))
      vine.stem.material.opacity =
        vine.stemOpacity * fade * smoothstep(progress * 10)

      for (const sprout of vine.sprouts) {
        const d = sprout.userData
        const growth = smoothstep((progress - d.t) / 0.08)
        const sway = 1 + 0.05 * Math.sin(elapsed * 0.8 + d.swayPhase)
        sprout.scale.setScalar(Math.max(0.001, d.targetScale * growth * sway))
        sprout.material.opacity = d.targetOpacity * growth * fade
      }
      return vine
    }

    function animate() {
      rafId = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.1)
      const elapsed = clock.getElapsedTime()
      vines = vines.map((v) => updateVine(v, dt, elapsed))
      renderer.render(scene, camera)
    }

    if (reducedMotion) {
      // Static, fully grown scene
      vines = vines.map((v) => updateVine(v, v.growDuration + 1, 0))
      renderer.render(scene, camera)
    } else {
      animate()
    }

    function onResize() {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      viewW = viewH * camera.aspect
      renderer.setSize(width, height)
      if (reducedMotion) renderer.render(scene, camera)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      vines.forEach((v) => disposeVine(v, scene))
      leafGeometry.dispose()
      blossomGeometry.dispose()
      leafTexture.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="vine-canvas" aria-hidden="true" />
}

export default memo(VineCanvas)
