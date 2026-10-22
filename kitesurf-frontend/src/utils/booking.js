export const getStartTimes = (daypart) => {
  const hours = daypart === 'ochtend'
    ? [9, 10, 11]
    : daypart === 'middag'
      ? [12, 13, 14, 15, 16, 17]
      : [];

  return hours.map((hour) => `${String(hour).padStart(2, '0')}:00`);
};

export const formatStartTime = (time) => (time ? time.slice(0, 5) : '');
