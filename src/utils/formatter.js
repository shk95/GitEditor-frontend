let options = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'Asia/Seoul'
};

export const formattedDate = (date) => new Intl.DateTimeFormat('ko-KR', options).format((date));
