import { useRef, useEffect, memo } from 'react'
import * as THREE from 'three'

const BIRD_COUNT = 9
const COLORS = [0xa89ba5, 0xb8b3cc, 0xe5c1ca, 0xc5a572, 0xb0bda3]

function makeBird(color) {
  const vertices = new Float32Array([
    0, 0, 5, -8, 0, 0, 0, 0, -3,
    0, 0, 5, 0, 0, -3, 8, 0, 0,
  ])
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2 + Math.random() * 0.15,
  })
  return new THREE.Mesh(geometry, material)
}

function BirdCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let width = window.innerWidth
    let height = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 5000)
    camera.position.z = 400

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const birds = []
    for (let i = 0; i < BIRD_COUNT; i++) {
      const bird = makeBird(COLORS[i % COLORS.length])
      bird.position.set(
        (Math.random() - 0.5) * 900,
        Math.random() * 200 - 50,
        Math.random() * -200
      )
      bird.scale.setScalar(1.8 + Math.random() * 1.2)
      bird.userData = {
        vx: 0.6 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
        wingSpeed: 4 + Math.random() * 3,
        yOscAmp: 0.2 + Math.random() * 0.4,
        yOscSpeed: 0.3 + Math.random() * 0.4,
        yPhase: Math.random() * Math.PI * 2,
        bankPhase: Math.random() * Math.PI * 2,
      }
      scene.add(bird)
      birds.push(bird)
    }

    const clock = new THREE.Clock()
    let rafId

    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      for (const bird of birds) {
        const d = bird.userData

        bird.position.x += d.vx
        bird.position.y += Math.sin(t * d.yOscSpeed + d.yPhase) * d.yOscAmp

        if (bird.position.x > 550) {
          bird.position.x = -550
          bird.position.y = Math.random() * 200 - 50
        }

        // Wing flap
        const flapAngle = Math.sin(t * d.wingSpeed + d.phase) * 3
        const pos = bird.geometry.attributes.position.array
        pos[4] = flapAngle   // left wing tip Y
        pos[16] = flapAngle  // right wing tip Y
        bird.geometry.attributes.position.needsUpdate = true

        // Banking
        bird.rotation.z = Math.sin(t * 0.5 + d.bankPhase) * 0.15
        bird.rotation.x = Math.sin(t * d.yOscSpeed + d.yPhase) * 0.08
      }

      renderer.render(scene, camera)
    }

    animate()

    function onResize() {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
      birds.forEach((b) => {
        b.geometry.dispose()
        b.material.dispose()
      })
    }
  }, [])

  return <div ref={mountRef} className="bird-canvas" />
}

export default memo(BirdCanvas)
