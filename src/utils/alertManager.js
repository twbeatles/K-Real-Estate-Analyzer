export const checkAlerts = (data, alerts) => {
    if (!data || !alerts || alerts.length === 0) return [];

    const newNotifications = [];
    const now = new Date();

    // 데이터 추출
    const historical = data.historical || [];
    const interestRates = data.interestRates || [];

    if (historical.length < 2) return [];

    const latest = historical[historical.length - 1];
    const prev = historical[historical.length - 2];

    // 서울 매매가 변동률
    const seoulPriceChange = ((latest.seoul - prev.seoul) / prev.seoul) * 100;

    // 금리 정보
    const currentRate = interestRates.length > 0 ? interestRates[interestRates.length - 1].rate : 3.5;
    const prevRate = interestRates.length > 1 ? interestRates[interestRates.length - 2].rate : 3.5;

    alerts.forEach(alert => {
        if (!alert.enabled) return;

        // 이미 알림을 보냈는지 확인 (간단하게 날짜로 체크하거나, 실제로는 더 복잡한 로직 필요)
        // 여기서는 매번 데이터 로드 시 체크하므로, 중복 방지 로직이 필요하지만
        // 데모 목적상 데이터가 변경되었을 때만 트리거된다고 가정.

        // 1. 가격 변동 알림
        if (alert.type === 'price') {
            const threshold = alert.threshold || 0;

            if (alert.condition === 'increase' && seoulPriceChange >= threshold) {
                newNotifications.push({
                    id: Date.now() + Math.random(),
                    type: 'price',
                    title: `${alert.region} 아파트 가격 상승`,
                    message: `${alert.region} 아파트 가격이 전월 대비 ${seoulPriceChange.toFixed(2)}% 상승했습니다. (설정값: ${threshold}%)`,
                    severity: 'warning',
                    timestamp: now.toISOString(),
                    read: false
                });
            } else if (alert.condition === 'decrease' && seoulPriceChange <= -threshold) {
                newNotifications.push({
                    id: Date.now() + Math.random(),
                    type: 'price',
                    title: `${alert.region} 아파트 가격 하락`,
                    message: `${alert.region} 아파트 가격이 전월 대비 ${Math.abs(seoulPriceChange).toFixed(2)}% 하락했습니다. (설정값: ${threshold}%)`,
                    severity: 'info',
                    timestamp: now.toISOString(),
                    read: false
                });
            }
        }

        // 2. 금리 변동 알림
        if (alert.type === 'rate') {
            const isChanged = currentRate !== prevRate;
            if (alert.condition === 'change' && isChanged) {
                newNotifications.push({
                    id: Date.now() + Math.random(),
                    type: 'rate',
                    title: '기준금리 변동',
                    message: `기준금리가 ${prevRate}%에서 ${currentRate}%로 변동되었습니다.`,
                    severity: currentRate > prevRate ? 'warning' : 'success',
                    timestamp: now.toISOString(),
                    read: false
                });
            }
        }
    });

    return newNotifications;
};
