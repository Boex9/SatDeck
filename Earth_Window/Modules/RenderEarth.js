import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";

export function RenderEarth(scene,render)
{

    const loader = new THREE.TextureLoader();
    loader.load("./Earth_Window/Earth_Textures/Skybox.jpg", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; 
    scene.background = texture;
        texture.colorSpace = THREE.SRGBColorSpace;

    }   );


    const Earth_Geometry = new THREE.SphereGeometry(1,70,70);
    const InnerGeometery = new THREE.SphereGeometry(0.99,80,80);
    const BlackMat = new THREE.MeshBasicMaterial({color:0x000000});
    const texture = new THREE.TextureLoader().load("./Earth_Window/Earth_Textures/earthmap4k.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    const Earth_Material = new THREE.MeshStandardMaterial({
                            map: texture,
                            roughness: 1,
                            metalness: 0
    });
    

    const Earth_Mesh = new THREE.Mesh(Earth_Geometry,Earth_Material);
    const InisdeMesh = new THREE.Mesh(InnerGeometery,BlackMat);
    //scene.add(InisdeMesh);
    scene.add(Earth_Mesh);
}


