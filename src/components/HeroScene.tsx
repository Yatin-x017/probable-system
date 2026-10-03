import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShape({ position, color, speed, distort }: {
  position: [number, number, number]
  color: string
  speed: number
  distort: number
}) {
  const { camera } = useThree()
  const [pos, setPos] = useState(position)
  const dragging = useRef(false)
  const dragPlane = useRef(new THREE.Plane())
  const dragOffset = useRef(new THREE.Vector3())

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    dragging.current = true
    ;(e.target as unknown as Element).setPointerCapture?.(e.pointerId)
    document.body.style.cursor = 'grabbing'

    // A plane facing the camera, passing through the sphere's current spot —
    // dragging slides the sphere across this plane instead of toward/away
    // from the camera.
    const normal = new THREE.Vector3()
    camera.getWorldDirection(normal)
    dragPlane.current.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(...pos))

    if (e.ray.intersectPlane(dragPlane.current, dragOffset.current)) {
      dragOffset.current.sub(new THREE.Vector3(...pos))
    } else {
      dragOffset.current.set(0, 0, 0)
    }
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    e.stopPropagation()
    const hit = new THREE.Vector3()
    if (e.ray.intersectPlane(dragPlane.current, hit)) {
      hit.sub(dragOffset.current)
      setPos([hit.x, hit.y, hit.z])
    }
  }

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    dragging.current = false
    ;(e.target as unknown as Element).releasePointerCapture?.(e.pointerId)
    document.body.style.cursor = 'auto'
  }

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        position={pos}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerOver={() => {
          if (!dragging.current) document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          if (!dragging.current) document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2}
          roughness={0.45}
          metalness={0.4}
          envMapIntensity={0.5}
        />
      </mesh>
    </Float>
  )
}

// Gentle, ambient parallax: the whole scene tilts a couple degrees toward the
// cursor and lerps back to rest — no drag-to-rotate, this is a backdrop, not
// a toy. Respects prefers-reduced-motion by simply not moving.
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const { pointer } = useThree()
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useFrame(() => {
    if (!group.current || reduced) return
    const targetY = pointer.x * 0.18
    const targetX = -pointer.y * 0.1
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.04)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04)
  })

  return <group ref={group}>{children}</group>
}

function Scene() {
  return (
    <ParallaxRig>
      {/* Soft layered lighting: a dim ambient fill, one warm key light, one
          cool rim light picking up the accent color from behind. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <directionalLight position={[-4, 2, -3]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} color="#4A90E2" intensity={0.4} />
      <Environment preset="studio" environmentIntensity={0.25} />

      <FloatingShape
        position={[-2.5, 0.5, 0]}
        color="#4A90E2"
        speed={1.5}
        distort={0.3}
      />
      <FloatingShape
        position={[2.5, -0.5, -1]}
        color="#FF6B6B"
        speed={2}
        distort={0.4}
      />
      <FloatingShape
        position={[0, 1.5, -2]}
        color="#FFD93D"
        speed={1.8}
        distort={0.2}
      />
      <FloatingShape
        position={[1, -1.5, 0]}
        color="#6BCB77"
        speed={2.2}
        distort={0.35}
      />
    </ParallaxRig>
  )
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
