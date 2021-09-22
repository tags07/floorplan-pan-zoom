export function lerp(a, b, t) {
  return a + t * (b - a);
}

export function getRotatedCoordinate(cx, cy, x, y, angle) {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (x - cx) - sin * (y - cy) + cx;
  const ny = cos * (y - cy) + sin * (x - cx) + cy;
  return [nx, ny];
}

export function getRealPointCoordinateRelativeToDigitisationZone(
  digitisationSpace,
  rotationInDegree,
  x,
  y
) {
  const realPointCoordinates = [
    lerp(
      digitisationSpace.origin[0],
      digitisationSpace.origin[0] + digitisationSpace.width,
      x
    ),
    lerp(
      digitisationSpace.origin[1],
      digitisationSpace.origin[1] + digitisationSpace.height,
      y
    )
  ];

  const digitisationZoneOriginCoordinate = [
    lerp(
      digitisationSpace.origin[0],
      digitisationSpace.origin[0] + digitisationSpace.width,
      0
    ),
    lerp(
      digitisationSpace.origin[1],
      digitisationSpace.origin[1] + digitisationSpace.height,
      0
    )
  ];

  const realRotatedPointCoordinates = getRotatedCoordinate(
    digitisationZoneOriginCoordinate[0],
    digitisationZoneOriginCoordinate[1],
    realPointCoordinates[0],
    realPointCoordinates[1],
    rotationInDegree
  );

  return realRotatedPointCoordinates;
}

export function getPercentageCoordinateRelativeToDigitisationZone(
  digitisationSpace,
  rotationInDegree,
  x,
  y
) {
  const digitisationZoneOriginCoordinate = [
    lerp(
      digitisationSpace.origin[0],
      digitisationSpace.origin[0] + digitisationSpace.width,
      0
    ),
    lerp(
      digitisationSpace.origin[1],
      digitisationSpace.origin[1] + digitisationSpace.height,
      0
    )
  ];

  const coordinatesBeforeRotation = getRotatedCoordinate(
    digitisationZoneOriginCoordinate[0],
    digitisationZoneOriginCoordinate[1],
    x,
    y,
    -rotationInDegree
  );

  const coordinatesBeforeOriginChange = [
    coordinatesBeforeRotation[0] - digitisationSpace.origin[0],
    coordinatesBeforeRotation[1] - digitisationSpace.origin[1]
  ];

  return [
    coordinatesBeforeOriginChange[0] / digitisationSpace.width,
    coordinatesBeforeOriginChange[1] / digitisationSpace.height
  ];
}
