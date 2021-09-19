import * as THREE from 'three';

// angle is in radians

export default function RotationFactory(angle) {
    // only does rotation about origin at the moment

    // pure; returns new THREE.Vector3

    function transformPoint(pt) {
        const newPt = pt.clone();

        newPt.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);

        return newPt;
    }

    // pure; returns new geometry

    function transformGeometry(geom) {
        const newGeom = geom.clone();

        newGeom.rotateZ(angle);

        return newGeom;
    }

    // pure; returns new mesh

    function transformMesh(mesh) {
        return mesh.clone();
    }

    return { transformPoint, transformMesh, transformGeometry };
}
