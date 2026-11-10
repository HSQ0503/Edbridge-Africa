// Column-major 4x4 matrices, the order WebGL's uniformMatrix4fv expects.
export type Matrix = Float32Array;

export function perspective(fieldOfView: number, aspect: number, near: number, far: number): Matrix {
  const focal = 1 / Math.tan(fieldOfView / 2);
  const depth = 1 / (near - far);
  return new Float32Array([
    focal / aspect, 0, 0, 0,
    0, focal, 0, 0,
    0, 0, (far + near) * depth, -1,
    0, 0, 2 * far * near * depth, 0,
  ]);
}

export function rotationX(angle: number): Matrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

export function rotationY(angle: number): Matrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

export function translation(x: number, y: number, z: number): Matrix {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  return Float32Array.from({ length: 16 }, (_, index) => {
    const column = Math.floor(index / 4);
    const row = index % 4;
    let sum = 0;
    for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[column * 4 + k];
    return sum;
  });
}
