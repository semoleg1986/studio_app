export default defineEventHandler(() => {
  return {
    items: [
      {
        id: 'course-math-5',
        title: 'Математика 5 класс',
        level: 'beginner',
        lessonsCount: 24
      },
      {
        id: 'course-physics-7',
        title: 'Физика 7 класс',
        level: 'intermediate',
        lessonsCount: 18
      },
      {
        id: 'course-olymp',
        title: 'Олимпиадная математика',
        level: 'advanced',
        lessonsCount: 30
      }
    ]
  };
});
