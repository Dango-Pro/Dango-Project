import { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { api } from "../libs/api";

interface Activity {
  date: string;
  count: number;
  level: number;
}

export default function StudyHeatmap() {
    const [data, setData] = useState<Activity[]>([]);

    useEffect(() => {
        api.get("/stats/activity").then(res => {
            const raw: {date: string, count: number}[] = res.data;
            const transformed = raw.map(item => ({
                date: item.date,
                count: item.count,
                level: getLevel(item.count)
            }));
            setData(transformed);
        }).catch(err => {
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

    if (data.length === 0) {
        return <p className="muted" style={{fontSize: '0.9rem', padding: 20, textAlign: 'center'}}>No study activity yet. Start studying!</p>;
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0' }}>
            <ActivityCalendar
                data={data}
                theme={{
                    // Pastel Pink Theme for the new design
                    light: ['#f8f8f8', '#ffe4e6', '#ffcdd2', '#f48fb1', '#ec407a'],
                    dark: ['#f8f8f8', '#ffe4e6', '#ffcdd2', '#f48fb1', '#ec407a'], // Using same pastel theme since we are light-mode focused now
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
