export function bd09mc2bd09(lng ,lat) {
  const MCBAND = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0]
  const MC2LL = [
    [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
    [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86],
    [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
    [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
    [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
    [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]
  ]
  function convertor(cC, cD) {
    if (!cC || !cD) {
      return null;
    }
    let T = cD[0] + cD[1] * Math.abs(cC.x);
    const cB = Math.abs(cC.y) / cD[9];
    let cE = cD[2] + cD[3] * cB + cD[4] * cB * cB +
      cD[5] * cB * cB * cB + cD[6] * cB * cB * cB * cB +
      cD[7] * cB * cB * cB * cB * cB +
      cD[8] * cB * cB * cB * cB * cB * cB;
    T *= (cC.x < 0 ? -1 : 1);
    cE *= (cC.y < 0 ? -1 : 1);
    return [T, cE];
  }

  function convertMC2LL(cB) {
    const cC = {
      x: Math.abs(cB.x),
      y: Math.abs(cB.y)
    };
    let cE;
    for (let cD = 0, len = MCBAND.length; cD < len; cD++) {
      if (cC.y >= MCBAND[cD]) {
        cE = MC2LL[cD];
        break;
      }
    }
    const T = convertor(cB, cE);
    return T;
  }

  return convertMC2LL({
    x: lng,
    y: lat,
  })
}

export function getCenterPoint(arrPoints) {
  const sortedLngArr = arrPoints.map(item => item.lng*1).sort();
  const sortedLatArr = arrPoints.map(item => item.lat*1).sort();
  const centerLng = ((sortedLngArr[0] + sortedLngArr[sortedLngArr.length - 1]) / 2).toFixed(4);
  const centerLat = ((sortedLatArr[0] + sortedLatArr[sortedLatArr.length - 1]) / 2).toFixed(4);
  return [centerLng, centerLat];
}
