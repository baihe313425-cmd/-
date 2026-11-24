import { suggestFloor, type PlazaInput } from './model'

const floor = suggestFloor(8, 5, 160)

export const samplePlaza: PlazaInput = {
  name: '示例·城南广场',
  grade: 'G4',
  clusterName: '低收益族群',
  lowYield: true,
  areaWan: 8,
  floors: 5,
  tenants: 160,
  revenue2027: 12000,
  noi2027: 4500,
  revenue2026: 11800,
  revenue2025: 11200,
  labor2027: 380,
  lines2027: {
    招商: 2,
    营运: 4,
    推广: 2,
    客服: 3,
    物业工程: 4,
    财务: 2,
    人事行政: 2,
  },
  outsource2027: 18,
  headcount2026: 70,
  labor2026: 1250,
  headcount2025: 76,
  labor2025: 1240,
  peerP25: 150,
  peerP50: 180,
  peerP75: 220,
  norm: {
    招商: 5,
    营运: 12,
    推广: 4,
    客服: 8,
    物业工程: 14,
    财务: 3,
    人事行政: 3,
  },
  floorLines: floor.lines,
  floorOutsource: floor.outsource,
}

export function clonePlaza(input: PlazaInput): PlazaInput {
  return {
    ...input,
    lines2027: { ...input.lines2027 },
    norm: { ...input.norm },
    floorLines: { ...input.floorLines },
  }
}
