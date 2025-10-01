// Sample data for development and testing
export const sampleGoals = [
  {
    title: "Aprender React Native",
    description: "Desenvolver habilidades em desenvolvimento mobile",
    progress_percentage: 75,
    category: "Desenvolvimento",
    importance_level: 4,
    target_date: "2025-03-15",
    status: "active"
  },
  {
    title: "Exercitar-se 5x na semana",
    description: "Manter uma rotina consistente de exercícios",
    progress_percentage: 60,
    category: "Saúde",
    importance_level: 5,
    target_date: "2025-02-28",
    status: "active"
  },
  {
    title: "Ler 12 livros este ano",
    description: "Expandir conhecimento através da leitura",
    progress_percentage: 25,
    category: "Educação", 
    importance_level: 3,
    target_date: "2025-12-31",
    status: "active"
  }
];

export const sampleTasks = [
  {
    title: "Estudar componentes React",
    description: "Revisar conceitos de props e state",
    status: "pending",
    priority: "alta",
    estimated_duration: 90,
    prerequisites: ["Aprender React Native"],
    is_ai_generated: false
  },
  {
    title: "Corrida matinal",
    description: "30m no parque central",
    status: "completed",
    priority: "media",
    estimated_duration: 45,
    prerequisites: [],
    is_ai_generated: false
  },
  {
    title: "Ler capítulo 3 - Clean Code",
    description: "Continuar leitura sobre código limpo",
    status: "pending",
    priority: "baixa", 
    estimated_duration: 60,
    prerequisites: ["Finalizar capítulo 2"],
    is_ai_generated: true
  }
];

// Function to create sample data for a user
export const createSampleData = async (userId: string, supabase: any) => {
  try {
    // Create sample goals
    const goalsToInsert = sampleGoals.map(goal => ({
      ...goal,
      user_id: userId
    }));

    const { data: insertedGoals, error: goalsError } = await supabase
      .from('goals')
      .insert(goalsToInsert)
      .select();

    if (goalsError) throw goalsError;

    // Create sample tasks linked to goals
    if (insertedGoals && insertedGoals.length > 0) {
      const tasksToInsert = sampleTasks.map((task, index) => ({
        ...task,
        user_id: userId,
        goal_id: insertedGoals[index % insertedGoals.length].id
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;
    }

    // Update profile with some initial stats
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        current_streak: 8,
        total_goals_completed: 12,
        total_tasks_completed: 147
      })
      .eq('user_id', userId);

    if (profileError) throw profileError;

    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};