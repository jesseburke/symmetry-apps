import * as THREE from 'three';

// line is expected to be created by LineFactory

export default function ReflectionFactory(line) {
    if (!line) {
        return;
    }

    const angle = line.getAngle();

    // in future will add in appropriate translations to suppport reflection about arbitrary lines

    // pure; takes a THREE.Vector3 and returns a new THREE.Vector3
    function transformPoint(pt) {
        const newPt = pt.clone();

        newPt.applyAxisAngle(line.getDirection(), Math.PI);

        return newPt;
    }

    // pure; returns new geometry

    function transformGeometry(geom) {
        const newGeom = geom.clone();

        newGeom.rotateZ(-angle);
        newGeom.rotateX(-Math.PI);
        newGeom.rotateZ(angle);

        return newGeom;
    }

    // pure; returns new mesh

    function transformMesh(mesh) {
        return mesh.clone();
    }

    const getAngle = () => angle;

    return { transformPoint, transformMesh, transformGeometry, getAngle };
}
