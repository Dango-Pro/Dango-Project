import { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { api } from "../libs/api";
import { useTranslation } from "react-i18next";

interface Activity {
  date: string;
  count: number;
  level: number;
}

export default function StudyHeatmap() {
    const { t } = useTranslation();
    const [data, setData] = useState<Activity[]>([]);

    useEffect(() => {
        api.get("/stats/activity").then(res => {
            // Transform data: [{date: '2023-10-01', count: 5}] -> React Activity Calendar format
            // react-activity-calendar expects { date, count, level }
            // Level is 0-4.
            const raw: {date: string, count: number}[] = res.data;
            const transformed = raw.map(item => ({
                date: item.date,
                count: item.count,
                level: getLevel(item.count)
            }));
            setData(transformed);
        }).catch(err => {
            // Silent fail or default empty
            console.error("Heatmap load failed", err);
        });
    }, []);

    const getLevel = (count: number) => {
        if (count === 0) return 0;
        if (count <= 10) return 1;
        if (count <= 30) return 2;
        if (count <= 60) return 3;
        return 4;
    };

    // Fill gaps? The lib handles sparse data usually, filling gaps with 0.
    // Wait, the lib *does* fill gaps if we provide start/end dates, or it just shows provided days.
    // It's better to provide a year's worth of data with 0s if we want a full calendar,
    // but let's see how it renders with sparse data first.
    // Actually, `react-activity-calendar` usually needs a continuous range or it renders just the blocks provided.
    // Let's rely on its default behavior for now (last year).

    // Generate empty data for the last year to ensure the calendar looks full?
    // The library calculates the range based on data or `blockMargin`.
    // Let's leave it dynamic.

    if (data.length === 0) {
        return <p className="muted" style={{fontSize: '0.9rem', padding: 20, textAlign: 'center'}}>No study activity yet. Start studying!</p>;
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0' }}>
            <ActivityCalendar
                data={data}
                theme={{
                    light: ['#f0f0f0', '#bae7ff', '#69c0ff', '#1890ff', '#0050b3'],
                    dark: ['#1f1f1f', '#003a8c', '#0050b3', '#1890ff', '#69c0ff'],
                }}
                labels={{
                    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    totalCount: '{{count}} reviews in {{year}}',
                    legend: {
                        less: 'Less',
                        more: 'More',
                    },
                }}
                showWeekdayLabels
                blockSize={12}
                blockMargin={4}
            />
        </div>
    );
}
