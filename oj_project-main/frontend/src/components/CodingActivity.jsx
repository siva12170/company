import React from 'react';

const CodingActivity = ({ submissions }) => {
    const [streakData, setStreakData] = React.useState({
        currentStreak: 0,
        longestStreak: 0,
        contributionData: []
    });

    React.useEffect(() => {
        if (submissions && submissions.length > 0) {
            calculateStreakData(submissions);
        }
    }, [submissions]);

    const calculateStreakData = (submissionsList) => {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        
        // Group accepted submissions by date
        const acceptedByDate = {};
        submissionsList
            .filter(sub => sub.verdict === 'Accepted')
            .forEach(sub => {
                const date = new Date(sub.createdAt).toDateString();
                acceptedByDate[date] = (acceptedByDate[date] || 0) + 1;
            });

        // Generate contribution data for the last year
        const contributionData = [];
        const current = new Date(oneYearAgo);
        
        while (current <= today) {
            const dateStr = current.toDateString();
            const count = acceptedByDate[dateStr] || 0;
            contributionData.push({
                date: new Date(current),
                count: count,
                level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4
            });
            current.setDate(current.getDate() + 1);
        }

        // Calculate streaks
        const sortedDates = Object.keys(acceptedByDate).sort((a, b) => new Date(a) - new Date(b));
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if today or yesterday has submissions for current streak
        if (acceptedByDate[today.toDateString()] || acceptedByDate[yesterday.toDateString()]) {
            let checkDate = new Date(today);
            if (!acceptedByDate[today.toDateString()]) {
                checkDate = yesterday;
            }
            
            while (acceptedByDate[checkDate.toDateString()]) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        // Calculate longest streak
        for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prevDate = new Date(sortedDates[i - 1]);
                const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
                
                if (dayDiff === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        setStreakData({
            currentStreak,
            longestStreak,
            contributionData
        });
    };

    const ContributionSquare = ({ day, index }) => {
        const colors = {
            0: 'bg-gray-100 border-gray-300 hover:bg-gray-200',
            1: 'bg-gray-300 border-gray-400 hover:bg-gray-400', 
            2: 'bg-gray-500 border-gray-600 hover:bg-gray-600',
            3: 'bg-gray-700 border-gray-800 hover:bg-gray-800',
            4: 'bg-black border-gray-900 hover:bg-gray-900'
        };

        const isToday = day.date.toDateString() === new Date().toDateString();
        const dayOfWeek = day.date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        return (
            <div
                key={index}
                className={`w-full aspect-square max-w-[12px] max-h-[12px] rounded-sm border transition-all duration-200 cursor-pointer ${colors[day.level]} ${
                    isToday ? 'ring-2 ring-black ring-opacity-70 shadow-lg' : ''
                } ${isWeekend ? 'ring-1 ring-gray-400 ring-opacity-30' : ''}`}
                title={`${day.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}: ${day.count} accepted solution${day.count !== 1 ? 's' : ''}`}
            />
        );
    };

    const generateCalendarWeeks = () => {
        if (!streakData.contributionData.length) return [];
        
        const weeks = [];
        const firstDate = streakData.contributionData[0].date;
        const startOfWeek = new Date(firstDate);
        
        // Find the Sunday of the week containing the first date
        startOfWeek.setDate(firstDate.getDate() - firstDate.getDay());
        
        // Create a map for quick lookup
        const dataMap = new Map();
        streakData.contributionData.forEach(day => {
            dataMap.set(day.date.toDateString(), day);
        });
        
        let currentWeek = [];
        let currentDate = new Date(startOfWeek);
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + (6 - today.getDay())); // End of current week
        
        while (currentDate <= endDate) {
            const dateStr = currentDate.toDateString();
            const dayData = dataMap.get(dateStr);
            
            if (dayData) {
                currentWeek.push(dayData);
            } else if (currentDate <= today) {
                // Create empty day data for dates before today that don't have submissions
                currentWeek.push({
                    date: new Date(currentDate),
                    count: 0,
                    level: 0
                });
            } else {
                // Add placeholder for future dates
                currentWeek.push(null);
            }
            
            // If it's Saturday or we've reached the end, push the week
            if (currentDate.getDay() === 6) {
                weeks.push([...currentWeek]);
                currentWeek = [];
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Push the last week if it's not empty
        if (currentWeek.length > 0) {
            // Fill the rest of the week with nulls
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }
        
        return weeks;
    };

    const getMonthLabels = () => {
        if (!streakData.contributionData.length) return [];
        
        const months = [];
        const firstDate = streakData.contributionData[0].date;
        const today = new Date();
        
        let current = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
        
        while (current <= today) {
            months.push({
                name: current.toLocaleDateString('en-US', { month: 'short' }),
                year: current.getFullYear(),
                month: current.getMonth()
            });
            current.setMonth(current.getMonth() + 1);
        }
        
        return months;
    };

    const calendarWeeks = generateCalendarWeeks();
    const monthLabels = getMonthLabels();
    const activeDays = streakData.contributionData.filter(d => d.count > 0).length;

    return (
        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-xl backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-200 pb-2">
                Coding Activity
            </h2>
            
            {/* Streak Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="text-black">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Streak</p>
                            <p className="text-lg font-semibold text-black">{streakData.currentStreak} days</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Longest Streak</p>
                            <p className="text-lg font-semibold text-black">{streakData.longestStreak} days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Summary */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-600">
                    {activeDays} days active in the last year
                </span>
                <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>
            
            {/* Calendar Grid without scrolling */}
            <div className="mb-6">
                <div className="w-full">
                    {/* Month labels with better visibility */}
                    <div className="flex gap-1 text-xs font-medium text-gray-700 mb-3">
                        <div className="w-12"></div>
                        {monthLabels.map((month, i) => (
                            <div key={`${month.year}-${month.month}`} className="flex-1 text-center px-1 py-1 bg-gray-100 rounded border border-gray-200">
                                {month.name}
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex gap-1">
                        {/* Day labels with better styling */}
                        <div className="flex flex-col gap-1 text-xs font-medium text-gray-700 justify-between h-full w-12">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                <div key={day} className="h-2.5 flex items-center justify-end pr-2">
                                    <span className="bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-xs">
                                        {day}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Calendar weeks */}
                        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${calendarWeeks.length}, minmax(0, 1fr))` }}>
                            {calendarWeeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {week.map((day, dayIndex) => {
                                        if (!day) {
                                            return <div key={dayIndex} className="w-full aspect-square max-w-[12px] max-h-[12px]" />;
                                        }
                                        return <ContributionSquare key={dayIndex} day={day} index={`${weekIndex}-${dayIndex}`} />;
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Legend */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Less active</span>
                        <div className="flex gap-1 items-center mx-3">
                            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300"></div>
                            <div className="w-3 h-3 rounded-sm bg-gray-300 border border-gray-400"></div>
                            <div className="w-3 h-3 rounded-sm bg-gray-500 border border-gray-600"></div>
                            <div className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-800"></div>
                            <div className="w-3 h-3 rounded-sm bg-black border border-gray-900"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">More active</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Hover over squares for details
                    </div>
                </div>
                
                {/* Activity levels description */}
                <div className="mt-3 grid grid-cols-5 gap-2 text-xs text-gray-600">
                    <div className="text-center">0 submissions</div>
                    <div className="text-center">1-2 submissions</div>
                    <div className="text-center">3-5 submissions</div>
                    <div className="text-center">6-10 submissions</div>
                    <div className="text-center">10+ submissions</div>
                </div>
            </div>
        </div>
    );
};

export default CodingActivity;
