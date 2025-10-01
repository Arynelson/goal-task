import { useState, useEffect, useRef } from 'react';
import { Edit2, Settings, LogOut, User, Trophy, Target, Calendar, Bell, Shield, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Profile {
  name: string;
  email: string;
  avatar_url: string | null;
  notification_enabled: boolean;
  dark_mode_enabled: boolean;
  current_streak: number;
  total_goals_completed: number;
  total_tasks_completed: number;
  member_since: string;
  language_preference: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Fetch actual stats from database
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, status')
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, status, completed_at')
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      if (error) throw error;
      if (data) {
        const completedGoals = goalsData?.length || 0;
        const completedTasks = tasksData?.length || 0;

        // Calculate current streak (consecutive days with completed tasks)
        let currentStreak = 0;
        if (tasksData && tasksData.length > 0) {
          const sortedTasks = tasksData
            .filter(t => t.completed_at)
            .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let checkDate = new Date(today);
          const completedDates = new Set(
            sortedTasks.map(t => {
              const d = new Date(t.completed_at!);
              d.setHours(0, 0, 0, 0);
              return d.getTime();
            })
          );

          // Check if there's activity today or yesterday to start streak
          const hasToday = completedDates.has(today.getTime());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const hasYesterday = completedDates.has(yesterday.getTime());

          if (hasToday || hasYesterday) {
            checkDate = hasToday ? today : yesterday;

            while (completedDates.has(checkDate.getTime())) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }
        }

        setProfile({
          name: data.name || 'Usuário',
          email: data.email || user?.email || '',
          avatar_url: data.avatar_url,
          notification_enabled: data.notification_enabled ?? true,
          dark_mode_enabled: data.dark_mode_enabled ?? false,
          current_streak: currentStreak,
          total_goals_completed: completedGoals,
          total_tasks_completed: completedTasks,
          member_since: data.member_since || data.created_at || new Date().toISOString(),
          language_preference: data.language_preference || 'pt',
        });

        setNewName(data.name || 'Usuário');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileSetting = async (field: string, value: boolean) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, [field]: value } : null);

      // Apply dark mode to document
      if (field === 'dark_mode_enabled') {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      toast({
        title: "Configuração atualizada",
        description: "Sua preferência foi salva com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, name: newName } : null);
      setEditDialogOpen(false);

      toast({
        title: "Nome atualizado",
        description: "Seu nome foi alterado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64 and store directly in profile (simpler approach)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: base64String })
            .eq('user_id', user?.id);

          if (updateError) throw updateError;

          setProfile(prev => prev ? { ...prev, avatar_url: base64String } : null);

          toast({
            title: "Foto atualizada",
            description: "Sua foto de perfil foi alterada com sucesso.",
          });
        } catch (error) {
          console.error('Error updating avatar:', error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a foto de perfil.",
            variant: "destructive",
          });
        } finally {
          setUploadingImage(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ler a imagem.",
        variant: "destructive",
      });
      setUploadingImage(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Apply dark mode on load
  useEffect(() => {
    if (profile?.dark_mode_enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.dark_mode_enabled]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Erro ao carregar perfil</p>
        </div>
      </Layout>
    );
  }

  const memberSinceDate = new Date(profile.member_since).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('profile')}</h1>
            <p className="text-muted-foreground">{t('profile-settings')}</p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="goal-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                <Camera className="w-3 h-3" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">
                {t('member-since')} {memberSinceDate}
              </p>
            </div>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Altere seu nome de exibição
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateName}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="stats-card text-center bg-primary/5 border-primary/20">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-2xl font-bold text-primary">{profile.total_goals_completed}</div>
            <div className="text-xs text-muted-foreground">{t('completed-goals')}</div>
          </Card>
          
          <Card className="stats-card text-center bg-success/5 border-success/20">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-success-foreground" />
            </div>
            <div className="text-2xl font-bold text-success">{profile.total_tasks_completed}</div>
            <div className="text-xs text-muted-foreground">{t('completed-tasks-profile')}</div>
          </Card>
          
          <Card className="stats-card text-center bg-warning/5 border-warning/20">
            <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4 h-4 text-warning-foreground" />
            </div>
            <div className="text-2xl font-bold text-warning">{profile.current_streak}</div>
            <div className="text-xs text-muted-foreground">{t('days')}</div>
            <div className="text-xs text-muted-foreground">{t('current-streak')}</div>
          </Card>
          
          <Card className="stats-card text-center bg-accent/20 border-accent/30">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="text-2xl font-bold text-accent-foreground">{t('current-level')}</div>
            <div className="text-xs text-muted-foreground">{t('current-level')}</div>
          </Card>
        </div>

        {/* Quick Settings */}
        <Card className="goal-card mb-6">
          <h3 className="font-semibold text-card-foreground mb-4">{t('quick-settings')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{t('notifications')}</p>
                  <p className="text-xs text-muted-foreground">{t('task-reminders')}</p>
                </div>
              </div>
              <Switch
                checked={profile.notification_enabled}
                onCheckedChange={(checked) => updateProfileSetting('notification_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{t('dark-mode')}</p>
                  <p className="text-xs text-muted-foreground">{t('night-appearance')}</p>
                </div>
              </div>
              <Switch
                checked={profile.dark_mode_enabled}
                onCheckedChange={(checked) => updateProfileSetting('dark_mode_enabled', checked)}
              />
            </div>

            <LanguageToggle />
          </div>
        </Card>

        {/* Sign Out */}
        <Card className="goal-card">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('sign-out')}
          </Button>
        </Card>

        {/* Talk with Us Button */}
        <div className="fixed bottom-24 right-6 z-40">
          <div className="bg-card rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-card-foreground">Talk with Us</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;