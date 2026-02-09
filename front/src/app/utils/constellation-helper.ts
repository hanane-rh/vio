// Utility to automatically add stars to constellation when tasks are completed
export function addTaskCompletionStar(taskTitle: string, taskType: 'daily' | 'challenge') {
  const existingStars = localStorage.getItem('carepath-constellation');
  const stars = existingStars ? JSON.parse(existingStars) : [];

  const newStar = {
    id: `auto-${Date.now()}`,
    x: Math.random() * 70 + 15,
    y: Math.random() * 70 + 10,
    date: new Date().toISOString(),
    type: taskType === 'challenge' ? 'milestone' : 'difficult-day',
    mood: 'accomplished',
    note: `Completed: ${taskTitle}`,
    size: taskType === 'challenge' ? 1.1 : 0.9,
  };

  const updatedStars = [...stars, newStar];
  localStorage.setItem('carepath-constellation', JSON.stringify(updatedStars));
  
  return newStar;
}
