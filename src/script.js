import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
let geometry
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    '/models/Circ/Circ.gltf',
    (gltf) =>
    {
        const model = gltf.scene
        const material = new THREE.MeshNormalMaterial({ wireframe: false })
        model.traverse(child => {
            child.material = material
          });
        
        geometry = model.children[0].geometry 
        const shape = new THREE.Mesh(geometry, material)
        shape.scale.set(0.025, 0.025, 0.025)
        scene.add(shape)

        tick()
    }

)

/**
 * twist
 */
 const twist = (geometry, twistAmount) =>
 {
    const quaternion = new THREE.Quaternion()
    const positionAttribute = geometry.attributes.position
    const vertices = new THREE.Vector3()    
    let newVertices = new Float32Array(positionAttribute.count * 3)
    let updateVertices = []
        
    for (let i = 0; i < positionAttribute.count; i++) {
        
        vertices.fromBufferAttribute(positionAttribute, i)
        const pos = vertices.x
        const upVec = new THREE.Vector3(1, 0, 0)

        quaternion.setFromAxisAngle(
            upVec, 
            (Math.PI / 180) * (pos / twistAmount)
        )
        vertices.applyQuaternion(quaternion)
        updateVertices.push(vertices.x, vertices.y, vertices.z )
    
    }
    newVertices = new Float32Array(updateVertices)
    geometry.setAttribute('position', new THREE.BufferAttribute( newVertices, 3 ))
 }

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, -15)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

 window.addEventListener('mousemove', onMouseUp, false);
 const mouse = new THREE.Vector2();

 function onMouseUp(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  

const clock = new THREE.Clock()
let previousTime = 0

let mat = Math.PI, speed = Math.PI / 120, forwards

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    mat = mat - deltaTime

    if(mat <= 0) {
        mat = Math.PI
        forwards = forwards * -1
    } else {
        forwards = 1
    }
    // run twist
    twist(geometry, (mat >= Math.PI / 2 ? -200 : 200) * forwards)


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

