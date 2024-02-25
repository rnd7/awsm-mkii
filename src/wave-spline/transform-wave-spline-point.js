export default function transformWaveSplinePoint(point, cx=.5, cy=.5, sx=1, sy=1, rx=1, ry=1) {
    if (sx == 1 && sy == 1) return point
    if (point.x < cx - rx || point.x > cx + rx) return point
    return {
        x: ((point.x-cx)*sx+cx),
        y: ((point.y-cy)*sy+cy),
        e: point.e
    }
}