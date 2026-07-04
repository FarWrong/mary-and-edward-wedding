import { useRef, useEffect, memo } from 'react'
import * as THREE from 'three'

const COLORS = [0xe5c1ca, 0xf2dde3, 0xb8b3cc, 0xd5d1e3, 0xc5a572, 0xc4bac2]

function makePetalTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.translate(size / 2, size / 2)
  const gradient = ctx.createRadialGradient(0, -10, 4, 0, 0, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0.85)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  // Petal: two mirrored bezier curves meeting at a point
  ctx.moveTo(0, -size * 0.42)
  ctx.bezierCurveTo(size * 0.36, -size * 0.28, size * 0.3, size * 0.3, 0, size * 0.42)
  ctx.bezierCurveTo(-size * 0.3, size * 0.3, -size * 0.36, -size * 0.28, 0, -size * 0.42)
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function PetalCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const isSmallScreen = window.innerWidth < 768
    const PETAL_COUNT = isSmallScreen ? 22 : 40

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

    const texture = makePetalTexture()
    const geometry = new THREE.PlaneGeometry(14, 18)
    const materials = COLORS.map(
      (color) =>
        new THREE.MeshBasicMaterial({
          map: texture,
          color,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
    )

    // View bounds at z=0 for spawning/recycling
    const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    let viewW = viewH * camera.aspect

    const petals = []
    for (let i = 0; i < PETAL_COUNT; i++) {
      const mat = materials[i % materials.length].clone()
      mat.opacity = 0.18 + Math.random() * 0.24
      const petal = new THREE.Mesh(geometry, mat)
      petal.position.set(
        (Math.random() - 0.5) * viewW * 1.1,
        (Math.random() - 0.5) * viewH * 1.2,
        Math.random() * -150
      )
      petal.scale.setScalar(0.4 + Math.random() * 0.6)
      petal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      petal.userData = {
        fallSpeed: 0.18 + Math.random() * 0.32,
        swayAmp: 0.3 + Math.random() * 0.5,
        swaySpeed: 0.4 + Math.random() * 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        rotX: (Math.random() - 0.5) * 0.012,
        rotY: (Math.random() - 0.5) * 0.016,
        rotZ: (Math.random() - 0.5) * 0.008,
      }
      scene.add(petal)
      petals.push(petal)
    }

    const clock = new THREE.Clock()
    let rafId

    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      for (const petal of petals) {
        const d = petal.userData
        petal.position.y -= d.fallSpeed
        petal.position.x += Math.sin(t * d.swaySpeed + d.swayPhase) * d.swayAmp
        petal.rotation.x += d.rotX
        petal.rotation.y += d.rotY
        petal.rotation.z += d.rotZ

        if (petal.position.y < -viewH * 0.65) {
          petal.position.y = viewH * 0.65
          petal.position.x = (Math.random() - 0.5) * viewW * 1.1
        }
      }

      renderer.render(scene, camera)
    }

    if (reducedMotion) {
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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      texture.dispose()
      materials.forEach((m) => m.dispose())
      petals.forEach((p) => p.material.dispose())
    }
  }, [])

  return <div ref={mountRef} className="petal-canvas" aria-hidden="true" />
}

export default memo(PetalCanvas)
